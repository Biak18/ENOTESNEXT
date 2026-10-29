import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

export interface EnAddressSelection {
  postalCode: string;
  address: string;
  detailAddress: string;
}

export interface EnPostPopupProps {
  open: boolean;
  initialValue?: Partial<EnAddressSelection>;
  onClose: () => void;
  onSelect: (address: EnAddressSelection) => void;
}

export default function EnPostPopup({
  open,
  initialValue = {},
  onClose,
  onSelect,
}: EnPostPopupProps) {
  const [postalCode, setPostalCode] = useState(initialValue.postalCode ?? "");
  const [address, setAddress] = useState(initialValue.address ?? "");
  const [detailAddress, setDetailAddress] = useState(initialValue.detailAddress ?? "");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enter address</DialogTitle>
      <DialogContent className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Local address entry only. No external postal-code lookup is connected.
        </p>
        <TextField label="Postal code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
        <TextField label="Address" value={address} onChange={(event) => setAddress(event.target.value)} required />
        <TextField label="Detailed address" value={detailAddress} onChange={(event) => setDetailAddress(event.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!address.trim()}
          onClick={() => onSelect({ postalCode, address, detailAddress })}
        >
          Use address
        </Button>
      </DialogActions>
    </Dialog>
  );
}
