import React, { useEffect, useState, useCallback, useMemo } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import {
  AlertCircle,
  RefreshCw,
  SearchX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CATEGORY_TABS = [
  { id: "", label: "All Products", count: 198 },
  { id: "Electronics", label: "Tech & Audio", count: 62 },
  { id: "Fashion", label: "Clothing & Fashion", count: 62 },
  { id: "Home", label: "Home & Living", count: 67 },
  { id: "Books", label: "Books & Learning", count: 7 },
];

const ITEMS_PER_PAGE = 16;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [wishlistIds, setWishlistIds] = useState(new Set());

  const fetchWishlistIds = useCallback(async () => {
    try {
      const res = await API.get("/wishlist");
      if (res.data?.success && Array.isArray(res.data.wishlist)) {
        const ids = new Set(res.data.wishlist.map((p) => String(p?._id || p)));
        setWishlistIds(ids);
      }
    } catch {
      setWishlistIds(new Set());
    }
  }, []);

  useEffect(() => {
    fetchWishlistIds();

    const handleWishlistUpdated = () => fetchWishlistIds();
    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
  }, [fetchWishlistIds]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedCategory && selectedCategory !== "All Categories") {
        params.category = selectedCategory;
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const response = await API.get("/products", { params });

      if (response.data && response.data.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProducts([]);
        setError(null);
      } else {
        setError("Something went wrong while loading products.");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSortBy("");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500">
            Official Catalog
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-display mt-0.5">
            {selectedCategory ? `${selectedCategory} Collection` : "All Products"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium">
            Browse our full catalog of 190+ products with instant delivery.
          </p>
        </div>

        {!loading && !error && (
          <div className="text-xs font-bold text-neutral-500 tabular-nums uppercase tracking-wider">
            Showing <span className="text-black font-extrabold">{products.length} Items</span>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id);
                setCurrentPage(1);
              }}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-bold tabular-nums ${
                isActive ? "text-neutral-300" : "text-neutral-500"
              }`}>
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-8">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={(val) => {
            setSelectedCategory(val);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={handleResetFilters}
        />
      </div>

      {loading && (
        <div id="loading-state" className="py-20 flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="w-full aspect-[4/3] rounded-xl bg-neutral-100" />
                <div className="h-4 bg-neutral-100 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
                <div className="h-10 bg-neutral-200 rounded-full mt-3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div
          id="error-state"
          className="mx-auto my-12 max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs"
        >
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={20} strokeWidth={2.2} />
          </div>
          <h2 className="text-base font-bold text-neutral-900">{error}</h2>
          <p className="mt-1 text-xs text-neutral-600">
            Unable to communicate with the product catalog. Please verify your connection.
          </p>
          <button
            onClick={fetchProducts}
            id="retry-fetch-btn"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div
          id="empty-state"
          className="mx-auto my-12 max-w-md rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-xs"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <SearchX size={24} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-black uppercase text-neutral-900 font-display">
            No Products Found
          </h2>
          <p className="mt-1 text-xs text-neutral-600">
            We couldn't find any products matching your active search or filters.
          </p>
          <button
            onClick={handleResetFilters}
            id="clear-filters-btn"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div
            id="products-grid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {currentProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(String(product._id))}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200 pt-8">
              <span className="text-xs font-semibold text-neutral-500 tabular-nums uppercase tracking-wider">
                Showing{" "}
                <span className="font-extrabold text-neutral-900">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                -{" "}
                <span className="font-extrabold text-neutral-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, products.length)}
                </span>{" "}
                of <span className="font-extrabold text-neutral-900">{products.length}</span> Products
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} strokeWidth={2.2} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-1 text-xs text-neutral-400 font-mono">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs font-black tabular-nums transition-colors cursor-pointer ${
                            currentPage === p
                              ? "bg-black text-white"
                              : "border border-neutral-300 bg-white text-neutral-800 hover:border-black"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;