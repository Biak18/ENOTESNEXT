import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ScreenProps, ScreenHandle } from "./screen-contract";
import { showEnConfirm, showEnDialog } from "../widgets/EnDialogService";
import type { ScreenKey } from "../types";


export type { ScreenHandle } from "./screen-contract";
type Product = { code: string; name: string; group: string; unit: string; price: number; qty: number };
type Line = { id: number; code: string; description: string; qty: number; price: number };

const initialProducts: Product[] = [
  { code: "ITM-1001", name: "A4 Copy Paper В· 80 gsm", group: "Office supplies", unit: "Ream", price: 4.8, qty: 128 },
  { code: "ITM-1002", name: "Ballpoint Pen В· Blue", group: "Writing", unit: "Box", price: 8.5, qty: 46 },
  { code: "ITM-1003", name: "Thermal Receipt Roll", group: "Point of sale", unit: "Pack", price: 12, qty: 32 },
  { code: "ITM-1004", name: "Desktop Calculator", group: "Office supplies", unit: "Each", price: 16.9, qty: 18 },
  { code: "ITM-1005", name: "Lever Arch File В· Navy", group: "Filing", unit: "Each", price: 3.25, qty: 74 },
];
const mockMenus = [
  { code: "MN-001", name: "Dashboard", type: "Screen", module: "General", parent: "вЂ”", dll: "DashboardView" },
  { code: "MN-014", name: "Purchase Registration", type: "Screen", module: "Purchase", parent: "Purchase", dll: "PurchaseEntry" },
  { code: "MN-021", name: "Products", type: "Screen", module: "Inventory", parent: "Inventory", dll: "ProductList" },
  { code: "MN-025", name: "Stock Balance", type: "Report", module: "Inventory", parent: "Inventory", dll: "StockBalance" },
  { code: "MN-041", name: "Customers", type: "Screen", module: "Contacts", parent: "Contacts", dll: "CustomerList" },
];
const sampleTransactions = [
  { code: "PU-0132", date: "22 Oct 2026", party: "Golden Star Trading", status: "Received", amount: "$ 1,245.00" },
  { code: "PU-0131", date: "21 Oct 2026", party: "City Office Supply", status: "Pending", amount: "$ 824.50" },
  { code: "PU-0130", date: "20 Oct 2026", party: "Mandalay Wholesale", status: "Received", amount: "$ 2,180.00" },
  { code: "PU-0129", date: "18 Oct 2026", party: "Golden Star Trading", status: "Received", amount: "$ 456.75" },
];

export const ScreenContent = forwardRef<ScreenHandle, ScreenProps>(function ScreenContent({ screen, tabTitle, notify }, ref) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [vendor, setVendor] = useState("");
  const [docDate, setDocDate] = useState("2026-10-22");
  const [reference, setReference] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: 1, code: "ITM-1001", description: "A4 Copy Paper В· 80 gsm", qty: 10, price: 4.8 }]);
  const [menus, setMenus] = useState(mockMenus);
  const [selectedMenuCode, setSelectedMenuCode] = useState(mockMenus[0].code);
  const [menuDraft, setMenuDraft] = useState(mockMenus[0]);
  const [formDirty, setFormDirty] = useState(false);

  const filteredProducts = useMemo(() => products.filter((row) => `${row.code} ${row.name} ${row.group}`.toLowerCase().includes(filter.toLowerCase())), [products, filter]);
  const filteredTransactions = useMemo(() => sampleTransactions.filter((row) => `${row.code} ${row.party} ${row.status}`.toLowerCase().includes(filter.toLowerCase())), [filter]);
  const filteredMenus = useMemo(() => menus.filter((row) => `${row.code} ${row.name} ${row.module}`.toLowerCase().includes(filter.toLowerCase())), [menus, filter]);

  useImperativeHandle(ref, () => {
    const handlers = {
      canClose: async () => !formDirty || (await showEnConfirm("Discard unsaved changes in this local draft?")) === true,
    } as ScreenHandle;
    if (screen !== "dashboard") {
      handlers.search = () => { searchRef.current?.focus(); notify(`Search ${tabTitle} by name, code, or reference.`); };
    }
    if (screen !== "dashboard" && !(screen.endsWith("history") || screen === "report" || screen === "balance")) {
      handlers.save = () => {
        if (screen === "sales") {
          if (!vendor.trim()) { notify("Choose a customer before saving this local draft."); return; }
          if (!lines.length || lines.some((line) => !line.description.trim() || line.qty <= 0)) { notify("Add a description and quantity for each detail row."); return; }
          setFormDirty(false); notify(`${tabTitle} saved in this local demo. No server was contacted.`);
        } else if (screen === "menus") {
          if (!menuDraft.name.trim() || !menuDraft.code.trim()) { notify("Menu code and menu name are required."); return; }
          setMenus((items) => selectedMenuCode ? items.map((item) => item.code === selectedMenuCode ? menuDraft : item) : [...items, menuDraft]);
          setSelectedMenuCode(menuDraft.code); setFormDirty(false); notify("Menu details saved locally in this demo.");
        } else notify(`${tabTitle} saved locally in this demo. No server was contacted.`);
      };
    }
    if (screen !== "dashboard" && screen !== "menus") {
      handlers.print = () => void showEnDialog("info", "Print preview is not part of this prototype.");
    }
    if (screen !== "dashboard" && screen !== "menus" && screen !== "sales") {
      handlers.excel = () => void showEnDialog("info", "Excel export is not part of this prototype.");
    }
    if (screen === "products") {
      handlers.insert = () => { const code = `ITM-${String(1001 + products.length).padStart(4, "0")}`; setProducts((items) => [...items, { code, name: "New demo item", group: "Uncategorized", unit: "Each", price: 0, qty: 0 }]); notify("A sample item was added to this tab."); };
      handlers.delete = async () => { if (!selectedProducts.length) { notify("Select one or more items to delete."); return; } if (!(await showEnConfirm(`Delete ${selectedProducts.length} selected item(s) from this local demo?`))) return; setProducts((items) => items.filter((item) => !selectedProducts.includes(item.code))); setSelectedProducts([]); notify("Selected demo items deleted locally."); };
    }
    if (screen === "sales") {
      handlers.insert = () => { setVendor(""); setReference(""); setLines([]); setFormDirty(false); notify(`A new ${tabTitle.toLowerCase()} draft is ready.`); };
      handlers.delete = async () => { if (!(await showEnConfirm(`Clear this ${tabTitle.toLowerCase()} draft?`))) return; setVendor(""); setReference(""); setLines([]); setFormDirty(false); notify("Draft cleared locally."); };
    }
    if (screen === "menus") {
      handlers.insert = () => { const draft = { code: `MN-${String(50 + menus.length).padStart(3, "0")}`, name: "", type: "Screen", module: "General", parent: "?", dll: "" }; setMenuDraft(draft); setSelectedMenuCode(""); setFormDirty(false); notify("New menu details are ready to edit."); };
      handlers.delete = async () => { if (!selectedMenuCode) { notify("Select a saved menu entry to delete."); return; } if (!(await showEnConfirm(`Delete ${menuDraft.name || "this menu"} from the local demo?`))) return; const remaining = menus.filter((item) => item.code !== selectedMenuCode); setMenus(remaining); const next = remaining[0]; if (next) { setSelectedMenuCode(next.code); setMenuDraft(next); } notify("Menu entry deleted from local demo data."); };
    }
    return handlers;
  }, [screen, tabTitle, notify, products.length, selectedProducts, vendor, lines, menuDraft, formDirty, selectedMenuCode, menus]);

  if (screen === "dashboard") return <Dashboard />;
  if (screen === "products") return <Products rows={filteredProducts} products={products} selected={selectedProducts} setSelected={setSelectedProducts} filter={filter} setFilter={setFilter} inputRef={searchRef} />;
  if (screen === "sales") return <SalesEntry vendor={vendor} setVendor={(value) => { setVendor(value); setFormDirty(true); }} date={docDate} setDate={(value) => { setDocDate(value); setFormDirty(true); }} reference={reference} setReference={(value) => { setReference(value); setFormDirty(true); }} lines={lines} setLines={(value) => { setLines(value); setFormDirty(true); }} filter={itemFilter} setFilter={setItemFilter} inputRef={searchRef} notify={notify} />;
  if (screen === "menus") return <MenuRegister menus={filteredMenus} allMenus={menus} selectedCode={selectedMenuCode} setSelectedCode={(code) => { setSelectedMenuCode(code); const next = menus.find((item) => item.code === code); if (next) { setMenuDraft(next); setFormDirty(false); } }} draft={menuDraft} setDraft={(draft) => { setMenuDraft(draft); setFormDirty(true); }} filter={filter} setFilter={setFilter} inputRef={searchRef} />;
  if (screen === "purchase-history" || screen === "sales-history" || screen === "report") return <History screen={screen} filter={filter} setFilter={setFilter} inputRef={searchRef} rows={filteredTransactions} />;
  return <GenericScreen screen={screen} tabTitle={tabTitle} filter={filter} setFilter={setFilter} inputRef={searchRef} rows={filteredProducts} />;
});

function FilterBox({ value, onChange, inputRef, placeholder }: { value: string; onChange: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; placeholder: string }) {
  return <label className="screen-filter"><span aria-hidden="true">вЊ•</span><input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} /><kbd>Enter</kbd></label>;
}

function Dashboard() {
  return <div className="dashboard"><div className="welcome-line"><div><h2>Good morning, Admin</h2><p>HereвЂ™s a quick look at your business today.</p></div><div className="date-chip">в—· &nbsp; Wednesday, 22 October 2026</div></div><div className="metric-row"><Metric label="TodayвЂ™s sales" value="$ 2,840.50" delta="в†‘ 12.8%" note="vs. previous day" accent="blue" /><Metric label="Open purchases" value="08" delta="3 due" note="pending receipt" accent="amber" /><Metric label="Items in stock" value="1,284" delta="24 low" note="need attention" accent="green" /><Metric label="Receivables" value="$ 8,320.00" delta="12 invoices" note="awaiting payment" accent="violet" /></div><div className="dashboard-grid"><div className="panel chart-panel"><div className="panel-head"><div><h3>Sales overview</h3><p>Sales performance through the week</p></div><span className="select-chip">This weekвЊ„</span></div><div className="chart-legend"><span><i className="legend-dot sales-dot" /> Sales</span><span><i className="legend-dot purchase-dot" /> Purchases</span></div><div className="chart"><div className="chart-y"><span>$4k</span><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div><div className="chart-main"><div className="grid-lines">{[0, 1, 2, 3, 4].map((tick) => <i key={tick} />)}</div><div className="bars">{[[42,25],[66,38],[52,31],[82,46],[61,35],[92,52],[72,42]].map((bar, i) => <div className="bar-pair" key={i}><i style={{ height: `${bar[0]}%` }} /><i style={{ height: `${bar[1]}%` }} /></div>)}</div><div className="chart-x">{["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"].map((day) => <span key={day}>{day}</span>)}</div></div></div></div><div className="panel activity-panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Latest updates across your workspace</p></div></div><Activity code="SA-0248" text="Sales invoice created" by="Mya Thandar" time="10:42 AM" color="blue" /><Activity code="PU-0132" text="Purchase received" by="Aung Ko" time="09:18 AM" color="green" /><Activity code="ITM-1006" text="Product added" by="Admin" time="Yesterday" color="violet" /><Activity code="SA-0247" text="Sales invoice created" by="Mya Thandar" time="Yesterday" color="amber" /></div></div><div className="bottom-note"><span>вњі</span> Demo data is for illustration. No business records are stored.</div></div>;
}

function Metric({ label, value, delta, note, accent }: { label: string; value: string; delta: string; note: string; accent: string }) { return <div className="metric"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${accent}`}>{accent === "blue" ? "в†—" : accent === "amber" ? "в—·" : accent === "green" ? "в–¦" : "в—‰"}</span></div><strong>{value}</strong><div className="metric-foot"><b className={accent}>{delta}</b><span>{note}</span></div></div>; }
function Activity({ code, text, by, time, color }: { code: string; text: string; by: string; time: string; color: string }) { return <div className="activity"><span className={`activity-mark ${color}`}>в†—</span><div className="activity-copy"><strong>{text}</strong><span>{code} <i>В·</i> {by}</span></div><time>{time}</time></div>; }

function Products({ rows, products, selected, setSelected, filter, setFilter, inputRef }: { rows: Product[]; products: Product[]; selected: string[]; setSelected: (items: string[]) => void; filter: string; setFilter: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null> }) {
  return <div className="feature-screen"><div className="feature-toolbar"><span><strong>{rows.length}</strong> sample records</span><FilterBox value={filter} onChange={setFilter} inputRef={inputRef} placeholder="Search product name or code" /><button className="button-primary" onClick={() => inputRef.current?.focus()}>Filter</button></div><div className="data-panel"><table><thead><tr><th><input type="checkbox" aria-label="Select all visible products" checked={rows.length > 0 && rows.every((item) => selected.includes(item.code))} onChange={(event) => setSelected(event.target.checked ? rows.map((item) => item.code) : [])} /></th><th>ITEM CODE</th><th>NAME</th><th>CATEGORY</th><th>UNIT</th><th>UNIT PRICE</th><th>IN STOCK</th></tr></thead><tbody>{rows.map((row, i) => <tr key={row.code}><td><input type="checkbox" aria-label={`Select ${row.name}`} checked={selected.includes(row.code)} onChange={(event) => setSelected(event.target.checked ? [...selected, row.code] : selected.filter((code) => code !== row.code))} /></td><td className="code-cell">{row.code}</td><td className="name-cell"><span className={`item-avatar tone-${i % 4}`}>{row.name[0]}</span>{row.name}</td><td>{row.group}</td><td>{row.unit}</td><td className="money-cell">${row.price.toFixed(2)}</td><td><span className="qty-pill">{row.qty}</span></td></tr>)}</tbody></table>{rows.length === 0 && <EmptyResult />}</div><div className="table-footer"><span>Showing {rows.length ? 1 : 0}вЂ“{rows.length} of {products.length} records В· local demo data</span><div><button disabled>вЂ№</button><button className="page-current">1</button><button disabled>вЂє</button></div></div></div>;
}

function SalesEntry({ vendor, setVendor, date, setDate, reference, setReference, lines, setLines, filter, setFilter, inputRef, notify }: { vendor: string; setVendor: (value: string) => void; date: string; setDate: (value: string) => void; reference: string; setReference: (value: string) => void; lines: Line[]; setLines: (rows: Line[]) => void; filter: string; setFilter: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; notify: (message: string) => void }) {
  const subtotal = lines.reduce((total, line) => total + line.qty * line.price, 0);
  const visibleLines = lines.filter((line) => `${line.code} ${line.description}`.toLowerCase().includes(filter.toLowerCase()));
  const saveDraft = () => {
    if (!vendor.trim()) { notify("Choose a customer before saving this local draft."); return; }
    if (!lines.length || lines.some((line) => !line.description.trim() || line.qty <= 0)) { notify("Add a description and quantity for each detail row."); return; }
    notify("Sales draft saved locally. No server was contacted.");
  };
  return <div className="feature-screen purchase-screen"><div className="form-panel"><div className="form-section-title"><div><h2>Sales details</h2><p>Enter the transaction header and line items.</p></div><span className="draft-state">Local draft</span></div><div className="form-grid"><label>Customer<select value={vendor} onChange={(event) => setVendor(event.target.value)}><option value="">Choose customer</option>{["Pioneer Retail", "Thiri Mart", "Central Office"].map((name) => <option key={name}>{name}</option>)}</select></label><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Reference<input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional reference" /></label><label>Notes<input placeholder="Add a note" /></label></div><div className="detail-heading"><div><h3>Items</h3><p>{lines.length} detail rows</p></div><div className="detail-actions"><input ref={inputRef} className="detail-search" aria-label="Search sales detail rows" placeholder="Search item rows" value={filter} onChange={(event) => setFilter(event.target.value)} /><button className="button-secondary" onClick={() => setLines([...lines, { id: Date.now(), code: "", description: "", qty: 1, price: 0 }])}>пј‹ Add row</button></div></div><div className="detail-grid-wrap"><table className="detail-grid"><thead><tr><th>ITEM CODE</th><th>DESCRIPTION</th><th>QUANTITY</th><th>UNIT PRICE</th><th>AMOUNT</th><th /></tr></thead><tbody>{visibleLines.map((line) => <tr key={line.id}><td><input aria-label="Item code" value={line.code} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, code: event.target.value } : item))} placeholder="Item code" /></td><td><input aria-label="Item description" value={line.description} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, description: event.target.value } : item))} placeholder="Description" /></td><td><input aria-label="Quantity" type="number" min="1" value={line.qty} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, qty: Number(event.target.value) } : item))} /></td><td><input aria-label="Unit price" type="number" min="0" step="0.01" value={line.price} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, price: Number(event.target.value) } : item))} /></td><td className="money-cell">${(line.qty * line.price).toFixed(2)}</td><td><button className="row-delete" aria-label="Delete detail row" disabled={lines.length <= 1} onClick={() => setLines(lines.filter((item) => item.id !== line.id))}>Г—</button></td></tr>)}</tbody></table>{!visibleLines.length && <EmptyResult message={filter ? "No detail rows match this search." : "No items yet. Use Add row to start the transaction."} />}</div><div className="purchase-total"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div><div className="form-actions"><span>Changes stay in this browser tabвЂ™s demo state.</span><button className="button-primary" onClick={saveDraft}>Save draft</button></div></div></div>;
}

function MenuRegister({ menus, allMenus, selectedCode, setSelectedCode, draft, setDraft, filter, setFilter, inputRef }: { menus: typeof mockMenus; allMenus: typeof mockMenus; selectedCode: string; setSelectedCode: (code: string) => void; draft: typeof mockMenus[number]; setDraft: (draft: typeof mockMenus[number]) => void; filter: string; setFilter: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null> }) {
  const update = (key: keyof typeof draft, value: string) => setDraft({ ...draft, [key]: value });
  return <div className="feature-screen menu-register"><div className="register-toolbar"><FilterBox value={filter} onChange={setFilter} inputRef={inputRef} placeholder="Search menu name" /><span>{menus.length} entries</span></div><div className="register-split"><div className="register-list"><div className="register-list-title">MENU ITEMS <span>{menus.length}</span></div>{menus.map((item) => <button key={item.code} className={`register-row ${item.code === selectedCode ? "selected" : ""}`} onClick={() => setSelectedCode(item.code)}><span className="screen-icon">в–§</span><span><strong>{item.name}</strong><small>{item.code} В· {item.module}</small></span></button>)}{menus.length === 0 && <p className="empty-hint">No matching menus.</p>}</div><div className="register-details"><div className="form-section-title"><div><h2>Menu details</h2><p>Illustrative navigation settings for this local prototype.</p></div><span className="draft-state">{selectedCode ? "Selected entry" : "New entry"}</span></div><div className="form-grid menu-fields"><label>Menu Code<input value={draft.code} onChange={(event) => update("code", event.target.value)} /></label><label>Menu Name<input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Enter menu name" /></label><label>Menu Type<select value={draft.type} onChange={(event) => update("type", event.target.value)}><option>Screen</option><option>Report</option><option>Folder</option></select></label><label>Module<select value={draft.module} onChange={(event) => update("module", event.target.value)}>{["General", "Purchase", "Sales", "Inventory", "Contacts", "Finance", "Reports", "Settings"].map((module) => <option key={module}>{module}</option>)}</select></label><label>Parent Menu<select value={draft.parent} onChange={(event) => update("parent", event.target.value)}>{["вЂ”", ...allMenus.map((item) => item.name)].map((parent) => <option key={parent}>{parent}</option>)}</select></label><label>DLL / Screen key<input value={draft.dll} onChange={(event) => update("dll", event.target.value)} placeholder="Optional screen identifier" /></label></div><div className="register-footnote">This menu register is mock data. Saving updates this tab only.</div></div></div></div>;
}

function History({ screen, filter, setFilter, inputRef, rows }: { screen: ScreenKey; filter: string; setFilter: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; rows: typeof sampleTransactions }) {
  const label = screen === "report" ? "Sales summary" : screen.startsWith("purchase") ? "Purchase" : "Sales";
  const data = screen === "report" ? rows.map((row) => ({ ...row, code: row.code.replace("PU", "SA") })) : rows;
  return <div className="feature-screen"><div className="feature-toolbar"><span><strong>{data.length}</strong> sample records</span><FilterBox value={filter} onChange={setFilter} inputRef={inputRef} placeholder={`Search ${label.toLowerCase()} records`} /><button className="select-chip">This monthвЊ„</button></div><div className="data-panel"><table><thead><tr><th>REFERENCE</th><th>DATE</th><th>{label === "Purchase" ? "SUPPLIER" : "CUSTOMER"}</th><th>STATUS</th><th>AMOUNT</th><th /></tr></thead><tbody>{data.map((row) => <tr key={row.code}><td className="code-cell">{row.code}</td><td>{row.date}</td><td className="name-cell">{row.party}</td><td><span className={`record-status ${row.status.toLowerCase()}`}>{row.status}</span></td><td className="money-cell">{row.amount}</td><td><button className="row-more" aria-label={`Options for ${row.code}`}>В·В·В·</button></td></tr>)}</tbody></table>{data.length === 0 && <EmptyResult />}</div><div className="table-footer"><span>Showing {data.length ? 1 : 0}вЂ“{data.length} of {data.length} demo records</span><div><button disabled>вЂ№</button><button className="page-current">1</button><button disabled>вЂє</button></div></div></div>;
}

function GenericScreen({ screen, tabTitle, filter, setFilter, inputRef, rows }: { screen: ScreenKey; tabTitle: string; filter: string; setFilter: (value: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; rows: Product[] }) {
  const isContacts = screen === "customers" || screen === "suppliers";
  const isBalance = screen === "balance" || screen === "stock";
  return <div className="feature-screen"><div className="feature-toolbar"><span><strong>{rows.length}</strong> sample records</span><FilterBox value={filter} onChange={setFilter} inputRef={inputRef} placeholder={`Search ${tabTitle.toLowerCase()}`} /><span className="mock-inline">Local demo data</span></div><div className="data-panel"><table><thead><tr>{(isContacts ? ["CODE", "NAME", "PHONE", "EMAIL", "BALANCE"] : isBalance ? ["ITEM CODE", "PRODUCT", "CATEGORY", "UNIT", "QUANTITY"] : ["ACCOUNT", "NAME", "TYPE", "MODULE", "STATUS"]).map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.code}>{isContacts ? <><td className="code-cell">{screen === "customers" ? "CUS" : "SUP"}-{row.code.slice(-4)}</td><td className="name-cell">{screen === "customers" ? ["Pioneer Retail", "Thiri Mart", "Central Office"][Number(row.code.slice(-1)) % 3] : ["Golden Star Trading", "City Office Supply", "Mandalay Wholesale"][Number(row.code.slice(-1)) % 3]}</td><td>+95 9 420 300 100</td><td>accounts@example.com</td><td className="money-cell">${(row.price * row.qty).toFixed(2)}</td></> : isBalance ? <><td className="code-cell">{row.code}</td><td className="name-cell">{row.name}</td><td>{row.group}</td><td>{row.unit}</td><td><span className="qty-pill">{row.qty}</span></td></> : <><td className="code-cell">AC-{row.code.slice(-4)}</td><td className="name-cell">{["Cash on hand", "Main bank account", "Accounts receivable", "Inventory"][Number(row.code.slice(-1)) % 4]}</td><td>{["Asset", "Bank", "Receivable", "Asset"][Number(row.code.slice(-1)) % 4]}</td><td>Finance</td><td><span className="record-status received">Active</span></td></>}</tr>)}</tbody></table>{rows.length === 0 && <EmptyResult />}</div><div className="table-footer"><span>Sample records В· changes are local to this tab</span></div></div>;
}

function EmptyResult({ message = "No records match this search." }: { message?: string }) { return <div className="empty-result"><span>вЊ•</span><strong>No results</strong><p>{message}</p></div>; }


