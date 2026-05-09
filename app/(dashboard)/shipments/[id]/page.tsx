import ShipmentDetailClient from './ShipmentDetailClient';

export async function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `shp-${String(i + 1).padStart(3, '0')}`,
  }));
}

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShipmentDetailClient id={id} />;
}