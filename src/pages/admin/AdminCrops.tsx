import React from "react";
import ReviewModule from "@/components/admin/ReviewModule";

const renderCropRow = (c: any) => (
  <div className="flex items-center gap-3">
    {c.crop_images?.[0] ? (
      <img src={c.crop_images[0]} alt={c.crop_name} className="h-12 w-12 rounded object-cover border" />
    ) : (
      <div className="h-12 w-12 rounded bg-muted" />
    )}
    <div className="min-w-0">
      <p className="font-semibold truncate">{c.crop_name}</p>
      <p className="text-xs text-muted-foreground truncate">
        {c.quantity} · ₹{c.price} · {c.quality_grade} · {c.location_address || "—"}
      </p>
    </div>
  </div>
);

const renderCropDetail = (c: any) => (
  <div className="space-y-3">
    {c.crop_images?.length > 0 && (
      <div className="grid grid-cols-3 gap-2">
        {c.crop_images.slice(0, 6).map((img: string, i: number) => (
          <img key={i} src={img} alt="" className="aspect-square rounded object-cover border" />
        ))}
      </div>
    )}
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div><span className="text-muted-foreground">Crop:</span> <strong>{c.crop_name}</strong></div>
      <div><span className="text-muted-foreground">Quantity:</span> {c.quantity}</div>
      <div><span className="text-muted-foreground">Price:</span> ₹{c.price}</div>
      <div><span className="text-muted-foreground">Grade:</span> {c.quality_grade}</div>
      <div><span className="text-muted-foreground">Harvest:</span> {c.harvest_date || "—"}</div>
      <div><span className="text-muted-foreground">Sell type:</span> {c.sell_type}</div>
      <div><span className="text-muted-foreground">Listing:</span> {c.listing_type}</div>
      <div><span className="text-muted-foreground">Available at:</span> {c.availability_location}</div>
      <div className="col-span-2"><span className="text-muted-foreground">Location:</span> {c.location_address || "—"}</div>
    </div>
  </div>
);

export const buildCropPage = (title: string, filterValue?: string) => () => (
  <ReviewModule
    title={title}
    table="farmer_crops"
    extraFilter={filterValue ? { column: "listing_type", value: filterValue } : undefined}
    renderRow={renderCropRow}
    renderDetail={renderCropDetail}
  />
);

export const AdminCropPerson = buildCropPage("Crop Person Review");
export const AdminDirectFromFarm = buildCropPage("Direct From Farm Review", "direct_from_farm");
export const AdminSellCrop = buildCropPage("Sell Crop Review", "sell_crop");
