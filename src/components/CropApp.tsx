import { useState } from 'react';
import TabBar from './TabBar';
import CropToolPanel from './CropToolPanel';
import type { Platform } from '../types';

function FlipkartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M3.833 1.333a.993.993 0 0 0-.333.061V1c0-.551.449-1 1-1h14.667c.551 0 1 .449 1 1v.333H3.833zm17.334 2.334H2.833c-.551 0-1 .449-1 1V23c0 .551.449 1 1 1h7.3l1.098-5.645h-2.24c-.051 0-5.158-.241-5.158-.241l4.639-.327-.078-.366-1.978-.285 1.882-.158-.124-.449-3.075-.467s3.341-.373 3.392-.373h3.232l.247-1.331c.289-1.616.945-2.807 1.973-3.693 1.033-.892 2.344-1.332 3.937-1.332.643 0 1.053.151 1.231.463.118.186.201.516.279.859.074.352.14.671.095.903-.057.345-.461.465-1.197.465h-.253c-1.327 0-2.134.763-2.405 2.31l-.243 1.355h1.54c.574 0 .781.402.622 1.306-.17.941-.539 1.36-1.111 1.36H14.9L13.804 24h7.362c.551 0 1-.449 1-1V4.667a1 1 0 0 0-.999-1zM20.5 2.333A.334.334 0 0 0 20.167 2H3.833a.334.334 0 0 0-.333.333V3h17v-.667z"
      />
    </svg>
  );
}

function MeeshoIcon() {
  return (
    <svg viewBox="0 0 192.756 192.756" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M96.378 8.504c-48.49 0-87.874 39.384-87.874 87.874s39.384 87.874 87.874 87.874 87.874-39.384 87.874-87.874S144.868 8.504 96.378 8.504zm0 12c41.87 0 75.874 34.004 75.874 75.874s-34.004 75.874-75.874 75.874S20.504 138.248 20.504 96.378 54.508 20.504 96.378 20.504z"
      />
      <text
        x="96"
        y="115"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="800"
        fontSize="100"
        fill="currentColor"
      >
        M
      </text>
    </svg>
  );
}

const TABS = [
  { id: 'flipkart', label: 'Flipkart', icon: <FlipkartIcon /> },
  { id: 'meesho', label: 'Meesho', icon: <MeeshoIcon /> },
];

const PLATFORM_CONFIG: Record<string, {
  platform: Platform;
  title: string;
  badge: { text: string; className: string };
  description: string;
}> = {
  flipkart: {
    platform: 'flipkart',
    title: 'Flipkart Shipping Label Crop',
    badge: { text: 'Flipkart', className: 'badge-flipkart' },
    description: 'Upload Flipkart shipping label PDF. Auto-detects labels, crops and groups by SKU.',
  },
  meesho: {
    platform: 'meesho',
    title: 'Meesho Shipping Label Crop',
    badge: { text: 'Meesho', className: 'badge-meesho' },
    description: 'Upload Meesho shipping label PDF. Auto-crops and groups by SKU.',
  },
};

export default function CropApp() {
  const [activeTab, setActiveTab] = useState('flipkart');

  return (
    <>
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="card main-card">
        <div className="card-body p-4">
          {PLATFORM_CONFIG[activeTab] && (
            <CropToolPanel
              key={activeTab}
              {...PLATFORM_CONFIG[activeTab]}
            />
          )}
        </div>
      </div>
    </>
  );
}
