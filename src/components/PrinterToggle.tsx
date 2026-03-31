import type { PrinterType } from '../types';

interface PrinterToggleProps {
  value: PrinterType;
  onChange: (type: PrinterType) => void;
  name: string;
}

export default function PrinterToggle({ value, onChange, name }: PrinterToggleProps) {
  return (
    <div className="printer-toggle">
      <label>
        <input
          type="radio"
          name={name}
          value="lbl"
          checked={value === 'lbl'}
          onChange={() => onChange('lbl')}
        />
        <span>Label Printer</span>
      </label>
      <label>
        <input
          type="radio"
          name={name}
          value="a4"
          checked={value === 'a4'}
          onChange={() => onChange('a4')}
        />
        <span>A4 Printer</span>
      </label>
    </div>
  );
}
