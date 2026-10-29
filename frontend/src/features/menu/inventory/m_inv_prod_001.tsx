import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import writeXlsxFile from "write-excel-file/browser";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgDataGrid } from "../../../components/data-grid/AgDataGrid";
import type {
  AgDataGridHandle,
  AgRow,
} from "../../../components/data-grid/agDataGridTypes";
import ComboBox from "../../../components/controls/Combobox";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { showEnDialog } from "../../../widgets/EnDialogService";
import {
  createProduct,
  filterProducts,
  initialProductFilters,
  initialProducts,
  productCategoryOptions,
  productUnitOptions,
  validateEditValue,
  type Product,
  type ProductFilters,
} from "./productsData";

const money = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function MoneyCell(params: ICellRendererParams) {
  return <span>${money.format(Number(params.value) || 0)}</span>;
}

const editableProps = new Set(["name", "category", "unit", "price", "inStock"]);

const baseColumnDefs: ColDef[] = [
  { field: "itemCode", headerName: "ITEM CODE", width: 110, editable: false },
  { field: "name", headerName: "NAME", width: 240 },
  {
    field: "category",
    headerName: "CATEGORY",
    width: 140,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: productCategoryOptions },
  },
  {
    field: "unit",
    headerName: "UNIT",
    width: 80,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: productUnitOptions },
  },
  {
    field: "price",
    headerName: "UNIT PRICE",
    width: 105,
    cellRenderer: MoneyCell,
    cellClass: "enotes-number-cell",
  },
  { field: "inStock", headerName: "IN STOCK", width: 95, cellClass: "enotes-number-cell" },
];

export const ProductsScreen = forwardRef<ScreenHandle, ScreenProps>(
  function ProductsScreen({ searchRef }, ref) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [filters, setFilters] = useState<ProductFilters>(initialProductFilters);
    const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
    const [invalidCell, setInvalidCell] = useState<{
      rowId: string;
      prop: string;
      message: string;
    } | null>(null);
    const [dirty, setDirty] = useState(false);
    const nextId = useRef(initialProducts.length + 1);
    const gridRef = useRef<AgDataGridHandle>(null);

    const visibleProducts = useMemo(
      () => filterProducts(products, filters),
      [filters, products],
    );

    const columns = useMemo<ColDef[]>(
      () =>
        baseColumnDefs.map((col) => {
          const field = String(col.field);
          return {
            ...col,
            cellClass: (params) =>
              [
                typeof col.cellClass === "string" ? col.cellClass : "",
                col.editable === false ? "enotes-readonly-cell" : "",
                invalidCell?.rowId === String(params.data?.id) &&
                invalidCell.prop === field
                  ? "enotes-invalid-cell"
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            valueSetter: editableProps.has(field)
              ? (params) => {
                  const result = validateEditValue(field, params.newValue);
                  if (!result.ok) {
                    setInvalidCell({
                      rowId: String(params.data.id),
                      prop: field,
                      message: result.message,
                    });
                    showEnDialog("error", result.message);
                    return false;
                  }
                  setInvalidCell((current) =>
                    current?.rowId === String(params.data.id) &&
                    current.prop === field
                      ? null
                      : current,
                  );
                  params.data[field] = result.value;
                  return true;
                }
              : undefined,
          };
        }),
      [invalidCell],
    );

    const updateFilters = useCallback((patch: Partial<ProductFilters>) => {
      setFilters((current) => ({ ...current, ...patch }));
    }, []);

    const focusSearch = useCallback(() => {
      searchRef.current?.focus();
      showEnDialog("info", "Search products by code, name, or category.")
    }, [searchRef]);

    const addRow = useCallback(() => {
      const id = `itm-${nextId.current}`;
      setProducts((current) => [...current, createProduct(id, nextId.current)]);
      nextId.current += 1;
      setFocusedRowId(id);
      setDirty(true);
      showEnDialog("info", "A product row was added to this local list.")
    }, []);

    const deleteFocusedRow = useCallback(() => {
      if (!products.length) {
        showEnDialog("info", "There are no products to remove.")
        return;
      }
      const targetId =
        focusedRowId && products.some((row) => row.id === focusedRowId)
          ? focusedRowId
          : products[products.length - 1]?.id;
      if (!targetId) return;
      const target = products.find((row) => row.id === targetId);
      if (
        !window.confirm(
          `Delete ${target?.name || "the focused product"} from this local demo?`,
        )
      ) {
        return;
      }
      setProducts((current) => current.filter((row) => row.id !== targetId));
      setFocusedRowId(null);
      setDirty(true);
      showEnDialog("info", "The product was removed from this local list.")
    }, [focusedRowId, products]);

    const save = useCallback(() => {
      const invalid = products.find(
        (row) => validateEditValue("name", row.name).ok === false,
      );
      if (invalid) {
        showEnDialog("info", "Every product needs a name before saving.")
        return;
      }
      setDirty(false);
      showEnDialog("info", "Products saved in this local demo. No server was contacted.")
    }, [products]);

    const exportExcel = useCallback(async () => {
      if (!products.length) {
        showEnDialog("info", "Add at least one product before exporting.")
        return;
      }
      try {
        const rows = [
          ["Item code", "Name", "Category", "Unit", "Unit price", "In stock"],
          ...products.map((row) => [
            row.itemCode,
            row.name,
            row.category,
            row.unit,
            { value: row.price, type: Number, format: "0.00" } as const,
            { value: row.inStock, type: Number } as const,
          ]),
        ];
        const workbook = await writeXlsxFile(rows, {
          sheet: "Products",
          columns: [
            { width: 14 },
            { width: 34 },
            { width: 20 },
            { width: 10 },
            { width: 14 },
            { width: 12 },
          ],
        });
        await workbook.toFile("products.xlsx");
        showEnDialog("info", "Products exported as a real .xlsx workbook.")
      } catch {
        showEnDialog("info", "Excel export failed. Try again with fewer products.")
      }
    }, [products]);

    const handleCellValueChanged = useCallback(
      ({ data }: { data: AgRow; colId: string; newValue: unknown; oldValue: unknown }) => {
        setProducts((current) =>
          current.map((row) =>
            row.id === String((data as Product).id)
              ? ({ ...row, ...(data as Product) } as Product)
              : row,
          ),
        );
        setDirty(true);
      },
      [],
    );

    const handleFocusedRow = useCallback((row: AgRow | null) => {
      if (row?.id) setFocusedRowId(String(row.id));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        search: focusSearch,
        insert: addRow,
        delete: deleteFocusedRow,
        save,
        excel: () => {
          void exportExcel();
        },
        canClose: () =>
          !dirty ||
          window.confirm("Discard unsaved changes in this products list?"),
      }),
      [addRow, deleteFocusedRow, dirty, exportExcel, focusSearch, save],
    );

    const gridFooter = (
      <div className="po-summary-area">
        <div className="po-total-row">
          <span>
            {visibleProducts.length} of {products.length} products
          </span>
          <span>Local demo data</span>
        </div>
      </div>
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Product search conditions">
          <SearchPanelField title="Item" htmlFor="product-item">
            <TextField
              id="product-item"
              fullWidth
              size="small"
              value={filters.item}
              onChange={(event) => updateFilters({ item: event.target.value })}
              placeholder="Code, name, or category"
              inputRef={searchRef}
            />
          </SearchPanelField>
          <SearchPanelField title="Category" htmlFor="product-category">
            <ComboBox
              id="product-category"
              options={productCategoryOptions}
              value={filters.category || null}
              onValueChanged={(category) =>
                updateFilters({ category: category ?? "" })
              }
              placeholder="All categories"
              clearable
              className="!py-0"
            />
          </SearchPanelField>
        </SearchPanel>

        <section className="po-detail-panel" aria-label="Product list">
          <div className="po-grid-toolbar">
            <div>
              <h2>
                Products<span>{visibleProducts.length}</span>
              </h2>
              <p>
                Edit cells inline. Item codes stay fixed; name, category, unit,
                price, and stock can change.
              </p>
            </div>
            <div className="po-grid-controls">
              <Button
                type="button"
                size="small"
                variant="outlined"
                className="button-secondary"
                onClick={addRow}
                aria-label="Add product"
                startIcon={<AddIcon fontSize="small" />}
              >
                Add row
              </Button>
              <Button
                type="button"
                className="button-secondary"
                size="small"
                variant="outlined"
                onClick={deleteFocusedRow}
                aria-label="Delete focused product"
                startIcon={<DeleteOutlinedIcon fontSize="small" />}
              >
                Delete row
              </Button>
            </div>
          </div>
          <div className="enotes-ag-grid-wrap">
            <AgDataGrid
              ref={gridRef}
              ariaLabel="Editable products"
              columnDefs={columns}
              rowData={visibleProducts as AgRow[]}
              getRowId={(data) => String((data as Product).id)}
              onCellValueChanged={handleCellValueChanged}
              onFocusedRowChanged={handleFocusedRow}
            />
          </div>
          {invalidCell && (
            <div className="po-validation" role="status">
              <span aria-hidden="true">!</span> {invalidCell.message} Correct
              the highlighted cell before saving or exporting.
            </div>
          )}
          {gridFooter}
          <div className="po-grid-footnote">
            <span>Mock data В· changes stay in this browser tab</span>
            <span>{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
          </div>
        </section>
      </div>
    );
  },
);



