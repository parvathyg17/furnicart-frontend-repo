import "../../styles/shop.css";

import "../../styles/home.css";

import useShopCatalog from "../../features/shop/useShopCatalog.js";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";
import ShopFiltersSidebar from "../../features/shop/components/ShopFiltersSidebar.jsx";
import ShopProductGrid from "../../features/shop/components/ShopProductGrid.jsx";
import ShopPageFooter from "../../features/shop/components/ShopPageFooter.jsx";

export default function Shop() {

  const {
    patchParams,
    draftSearch,
    setDraftSearch,
    applySearch,
    clearSearch,
    sort,
    category,
    roomType,
    minPrice,
    maxPrice,
    products,
    pagination,
    pageNumbers,
    categories,
    roomTypes,
    loading,
    error,
    toast,
    checkingAuth,
    handleAddToCart,
    handleWishlist,
  } = useShopCatalog();

  if (checkingAuth) {

    return (

      <div className="home-loading">
        Loading...
      </div>
    );
  }

  return (

    <div className="artisan-shop">

      <PublicNavbar />

      <main className="artisan-main-wrap">

        <h1 className="artisan-title artisan-font-serif">
          Shop
        </h1>

        <p className="artisan-lead">
          Curated furniture for calm, considered spaces — filter by room,
          category, and price.
        </p>

        {
          toast && (

            <div
              className="artisan-toast"
              role="status"
            >
              {toast}
            </div>
          )
        }

        {
          error && (

            <div
              className="artisan-banner error"
              role="alert"
            >
              {error}
            </div>
          )
        }

        <div className="artisan-layout">

          <ShopFiltersSidebar
            categories={categories}
            roomTypes={roomTypes}
            draftSearch={draftSearch}
            onDraftSearchChange={setDraftSearch}
            onApplySearch={applySearch}
            onClearSearch={clearSearch}
            sort={sort}
            onSortChange={(value) => {

              patchParams({
                sort: value,
                page: 1,
              });
            }}
            category={category}
            onCategoryChange={(slug) => {

              patchParams({
                category: slug,
                page: 1,
              });
            }}
            roomType={roomType}
            onRoomTypeChange={(slug) => {

              patchParams({
                room_type: slug,
                page: 1,
              });
            }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={(value) => {

              patchParams({
                min_price: value,
                page: 1,
              });
            }}
            onMaxPriceChange={(value) => {

              patchParams({
                max_price: value,
                page: 1,
              });
            }}
          />

          <section className="artisan-content">

            <ShopProductGrid
              loading={loading}
              products={products}
              pagination={pagination}
              pageNumbers={pageNumbers}
              onPageChange={(nextPage) => {

                patchParams({
                  page: nextPage,
                });
              }}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
            />
          </section>
        </div>
      </main>

      <ShopPageFooter />
    </div>
  );
}
