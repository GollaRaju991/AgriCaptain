import React from "react";
import ReviewModule from "@/components/admin/ReviewModule";

const AdminProducts = () => (
  <ReviewModule
    title="Seller Products"
    table="seller_products"
    renderRow={(p) => (
      <div className="flex items-center gap-3">
        {p.product_images?.[0] ? (
          <img src={p.product_images[0]} alt={p.product_name} className="h-12 w-12 rounded object-cover border" />
        ) : (
          <div className="h-12 w-12 rounded bg-muted" />
        )}
        <div className="min-w-0">
          <p className="font-semibold truncate">{p.product_name}</p>
          <p className="text-xs text-muted-foreground">{p.category} · {p.brand || "—"} · ₹{p.selling_price}</p>
        </div>
      </div>
    )}
    renderDetail={(p) => (
      <div className="space-y-3">
        {p.product_images?.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {p.product_images.slice(0, 6).map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="aspect-square rounded object-cover border" />
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Name:</span> <strong>{p.product_name}</strong></div>
          <div><span className="text-muted-foreground">Category:</span> {p.category}</div>
          <div><span className="text-muted-foreground">Sub-category:</span> {p.sub_category || "—"}</div>
          <div><span className="text-muted-foreground">Brand:</span> {p.brand || "—"}</div>
          <div><span className="text-muted-foreground">MRP:</span> ₹{p.mrp_price}</div>
          <div><span className="text-muted-foreground">Selling:</span> <strong>₹{p.selling_price}</strong></div>
          <div><span className="text-muted-foreground">Discount:</span> {p.discount_percent || 0}%</div>
          <div><span className="text-muted-foreground">Stock:</span> {p.stock_quantity}</div>
          <div><span className="text-muted-foreground">Unit:</span> {p.unit_type}</div>
          <div><span className="text-muted-foreground">Delivery:</span> {p.delivery_available ? `${p.delivery_days || "?"} days · ₹${p.delivery_charge || 0}` : "Not available"}</div>
          {p.crop_type && <div><span className="text-muted-foreground">Crop type:</span> {p.crop_type}</div>}
          {p.season && <div><span className="text-muted-foreground">Season:</span> {p.season}</div>}
          {p.suitable_soil && <div><span className="text-muted-foreground">Soil:</span> {p.suitable_soil}</div>}
          {p.shelf_life && <div><span className="text-muted-foreground">Shelf life:</span> {p.shelf_life}</div>}
        </div>
        {p.description && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{p.description}</p>
          </div>
        )}
      </div>
    )}
  />
);

export default AdminProducts;
