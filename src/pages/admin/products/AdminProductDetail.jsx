import "../../../styles/adminproductdetails.css";

import toast from "react-hot-toast";

import {
  toggleVariantStatus,
  clearProductMessages,
  getAdminProductDetail,
  toggleProductStatus,
  updateProduct,
} from "../../../features/catalog/product/productSlice";

import EditVariantModal
from "./EditVariantModal";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useParams,
  Link,
} from "react-router-dom";

import {
  Pencil,
  Plus,
  Upload,
  MoreHorizontal,
  Eye,
  EyeOff
} from "lucide-react";

import EditProductModal
from "./EditProductModal";

import CreateVariantModal
from "./CreateVariantModal";

export default function AdminProductDetail() {

  const dispatch = useDispatch();

  const { id } = useParams();

 

  const [
    openEditModal,
    setOpenEditModal,
  ] = useState(false);

  const [
    openVariantModal,
    setOpenVariantModal,
  ] = useState(false);



  const {
    productDetail,
    productLoading,
    productSuccess,
    productError,
  } = useSelector(
    (state) => state.product
  );


  const [
  openEditVariantModal,
  setOpenEditVariantModal,
] = useState(false);

const [
  selectedVariant,
  setSelectedVariant,
] = useState(null);

const handleEditVariant = (
  variant
) => {

  setSelectedVariant(
    variant
  );

  setOpenEditVariantModal(
    true
  );
};

const handleToggleVariant =
    async (variantId) => {

      try {

        await dispatch(
          toggleVariantStatus(
            variantId
          )
        ).unwrap();

        dispatch(
          getAdminProductDetail(
            id
          )
        );

      } catch (error) {

       
      }
    };

const handleToggleFeaturedProduct = async () => {
    try {
      await dispatch(
        updateProduct({
          productId: id,
          data: {
            name: productDetail.name,
            description: productDetail.description,
            category: productDetail.category?.id || productDetail.category,
            room_type_ids: productDetail.room_types?.map(r => r.id) || [],
            is_active: productDetail.is_active,
            is_featured: !productDetail.is_featured
          },
        })
      ).unwrap();
      dispatch(getAdminProductDetail(id));
    } catch (err) {
      toast.error("Failed to toggle featured status");
    }
  };

  const handleToggleActiveProduct = async () => {
    try {
      await dispatch(toggleProductStatus(id)).unwrap();
      dispatch(getAdminProductDetail(id));
    } catch (err) {
      
    }
  };

  useEffect(() => {

    if (id) {

      dispatch(
        getAdminProductDetail(id)
      );
    }

  }, [dispatch, id]);

  useEffect(() => {

    if (!productSuccess)
      return;

    toast.success(
      productSuccess
    );

    const timer =
      setTimeout(() => {

        dispatch(
          clearProductMessages()
        );
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, [

    dispatch,
    productSuccess,

  ]);

  useEffect(() => {

    if (!productError)
      return;

    toast.error(

      typeof productError === "string"

        ? productError

        : JSON.stringify(
            productError
          )
    );

    const timer =
      setTimeout(() => {

        dispatch(
          clearProductMessages()
        );
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, [

    dispatch,
    productError,

  ]);

  useEffect(() => {
    if (selectedVariant && productDetail) {
      const updatedVariant = productDetail.variants?.find(v => v.id === selectedVariant.id);
      if (updatedVariant) {
        setSelectedVariant(updatedVariant);
      }
    }
  }, [productDetail, selectedVariant]);

  if (!productDetail) {

    return (

      <div className="product-detail-loading">

        {
          productLoading

            ? "Loading..."

            : "Product not found."
        }

      </div>
    );
  }



  const variants =
    productDetail.variants || [];

  const hasSellableVariant =
    variants.some(
      (v) =>
        v.is_active &&
        (v.stock || 0) > 0
    );

  const showActiveProductStatus =
    Boolean(
      productDetail.is_active
    ) &&
    hasSellableVariant;

  const totalInventory =
    variants.reduce(
      (acc, item) =>
        acc + (item.stock || 0),
      0
    );

  const productImage =

      productDetail.thumbnail ||

      variants?.[0]
        ?.images?.[0]
        ?.image_url ||

      variants?.[0]
        ?.images?.[0]
        ?.image ||

      "";

  

  return (

    <div className="admin-product-detail-page">
      <div className="admin-product-header-section">
        {/* BREADCRUMBS */}
        <div className="product-breadcrumbs">
          <Link to="/admin/products">Products</Link>
          <span>{" > "}</span>
          {productDetail.breadcrumbs?.map((item, index) => (
             <span key={item.id}>
               <Link to={`/admin/categories/${item.slug}`}>{item.name}</Link>
               {index !== productDetail.breadcrumbs.length - 1 && <span>{" > "}</span>}
             </span>
          ))}
        </div>

        {/* TITLE ROW */}
        <div className="product-title-row">
          <div className="product-title-left">
            <h1>{productDetail.name}</h1>
            <span className={showActiveProductStatus ? "product-status active" : "product-status inactive"}>
              ● {showActiveProductStatus ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <button className="edit-product-btn" onClick={() => setOpenEditModal(true)}>
            <Pencil size={16} /> Edit Product
          </button>
        </div>
      </div>

      <div className="product-main-grid">
        {/* LEFT COLUMN */}
        <div className="product-main-left">
          
          {/* COMMON IMAGE */}
          <div className="product-common-image" style={{ marginBottom: '24px', overflow: 'hidden', height: '280px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'center' }}>
            {productImage ? (
              <img src={productImage} alt={productDetail.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div className="no-product-image" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
            )}
          </div>

          {/* STATS CARD */}
          <div className="product-stats-card">
             <div className="stat-item">
               <span className="stat-label">Created</span>
               <span className="stat-value">
                 {productDetail.created_at ? new Date(productDetail.created_at).toLocaleDateString("en-US", {month:"short", day:"2-digit", year:"numeric"}) : "-"}
               </span>
             </div>
             <div className="stat-item">
               <span className="stat-label">Inventory</span>
               <span className="stat-value">{totalInventory} Total Units</span>
             </div>
             <div className="stat-item">
               <span className="stat-label">Category</span>
               <span className="stat-value">{productDetail.category_name || "-"}</span>
             </div>
          </div>

          {/* DESCRIPTION CARD */}
          <div className="product-desc-card">
             <h4>Description</h4>
             <div className="desc-text-wrapper">
               <p>"{productDetail.description || "No description added."}"</p>
             </div>
          </div>

          {/* VARIANTS SECTION */}
          <div className="variants-section">
            <div className="variants-header">
              <div>
                <h2>Variants</h2>
                <p>Manage material finishes, colors, and stock levels</p>
              </div>
              <button className="add-variant-btn" onClick={() => setOpenVariantModal(true)}>
                <Plus size={16} /> Add Variant
              </button>
            </div>
            
            {variants.length > 0 ? (
              <div className="variants-list">
                 {variants.map(variant => (
                    <div key={variant.id} className="variant-row-card">
                       <img src={variant.images?.[0]?.image || variant.images?.[0]?.image_url || ""} alt="" className="variant-row-img" />
                       <div className="variant-row-info">
                         <h4>{variant.variant_name}</h4>
                         <span>SKU: {variant.sku || "-"}</span>
                       </div>
                       <div className="variant-row-details">
                         <span className="meta-label">DETAILS</span>
                         <span className="meta-val"><span className="color-dot"></span> {variant.material || "Material"}</span>
                       </div>
                       <div className="variant-row-price-stock">
                         <span className="meta-label">PRICE & STOCK</span>
                         <span className="meta-val price-val">₹{variant.price || "0.00"}</span>
                         <span className="meta-subval">{variant.stock || 0} in stock</span>
                       </div>
                       <div className="variant-row-actions">
                         <button onClick={() => handleEditVariant(variant)}><Pencil size={18} /></button>
                         <label className="switch" style={{ margin: 0, transform: 'scale(0.8)' }}>
                           <input 
                             type="checkbox" 
                             checked={variant.is_active || false} 
                             onChange={() => handleToggleVariant(variant.id)} 
                           />
                           <span className="slider"></span>
                         </label>
                       </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="empty-variants">No variants added yet</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="product-main-right">
          <div className="product-status-card">
            <h3>Product Status</h3>
            
            <div className="status-toggle-row">
              <div className="toggle-info">
                <h4>Featured</h4>
                <p>Highlight on storefront</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={productDetail.is_featured || false} onChange={handleToggleFeaturedProduct} disabled={productLoading} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="status-toggle-row">
              <div className="toggle-info">
                <h4>Active</h4>
                <p>Product visibility</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={productDetail.is_active || false} onChange={handleToggleActiveProduct} disabled={productLoading} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      

      <EditProductModal

        isOpen={
          openEditModal
        }

        onClose={() =>
          setOpenEditModal(false)
        }

        product={
          productDetail
        }

      />

      

      <CreateVariantModal

        isOpen={
          openVariantModal
        }

        onClose={() =>
          setOpenVariantModal(false)
        }

        productId={
          productDetail.id
        }

      />

      <EditVariantModal

        isOpen={
            openEditVariantModal
        }

        onClose={() =>
            setOpenEditVariantModal(false)
        }

        variant={
            selectedVariant
        }

        />

    </div>
  );
}