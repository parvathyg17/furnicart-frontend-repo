import "../../styles/account.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import AccountLayout from "../../components/user/AccountLayout.jsx";

import {
  fetchWalletApi,
  fetchWalletTransactionsApi,
} from "../../features/wallet/walletAPI.js";

import {
  formatMoney,
} from "../../utils/currency.js";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

function txnSign(
  type,
) {

  return type === "credit"
    ? "+"
    : "−";
}

export default function WalletPage() {

  const [
    wallet,
    setWallet,
  ] = useState(
    null,
  );

  const [
    transactions,
    setTransactions,
  ] = useState(
    [],
  );

  const [
    pagination,
    setPagination,
  ] = useState(
    {
      count: 0,
      total_pages: 1,
      current_page: 1,
    },
  );

  const [
    filterType,
    setFilterType,
  ] = useState(
    "",
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    txnLoading,
    setTxnLoading,
  ] = useState(
    false,
  );

  const [
    error,
    setError,
  ] = useState(
    null,
  );

  const loadWallet =
    useCallback(
      async () => {

        try {

          const data =
            await fetchWalletApi();

          setWallet(
            data,
          );

          setError(
            null,
          );
        } catch (
          err
        ) {

          setError(

            formatProductApiError(
              err.response?.data,
            ) ||

              "Could not load wallet.",
          );
        }
      },

      [],
    );

  const loadTransactions =
    useCallback(
      async (
        page = 1,
        type = "",
      ) => {

        setTxnLoading(
          true,
        );

        try {

          const data =
            await fetchWalletTransactionsApi(
              {
                page,
                pageSize: 10,
                type,
              },
            );

          setTransactions(
            data.results || [],
          );

          setPagination(
            {
              count:
                data.count || 0,
              total_pages:
                data.total_pages || 1,
              current_page:
                data.current_page || page,
            },
          );
        } catch (
          err
        ) {

          setError(

            formatProductApiError(
              err.response?.data,
            ) ||

              "Could not load transactions.",
          );
        } finally {

          setTxnLoading(
            false,
          );
        }
      },

      [],
    );

  useEffect(() => {

    let cancelled = false;

    (
      async () => {

        setLoading(
          true,
        );

        try {

          await loadWallet();

          if (
            !cancelled
          ) {

            await loadTransactions(
              1,
              "",
            );
          }
        } finally {

          if (
            !cancelled
          ) {

            setLoading(
              false,
            );
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, [loadWallet, loadTransactions]);

  const handleFilterChange =
    (
      type,
    ) => {

      setFilterType(
        type,
      );

      setError(
        null,
      );

      loadTransactions(
        1,
        type,
      );
    };

  const handlePageChange =
    (
      page,
    ) => {

      if (
        page < 1 ||
        page >
          pagination.total_pages
      ) {

        return;
      }

      loadTransactions(
        page,
        filterType,
      );
    };

  return (

    <AccountLayout>

      <div className="wallet-page">

        <header className="wallet-page-header">

          <h1 className="wallet-page-title artisan-font-serif">
            My Wallet
          </h1>

          <p className="wallet-page-lead">
            Store credit from refunds and use it on future orders.
          </p>

        </header>

        {
          error && (

            <div
              className="wallet-banner wallet-banner--error"
              role="alert"
            >
              {error}
            </div>
          )
        }

        {
          loading ? (

            <p className="wallet-muted">
              Loading wallet…
            </p>
          ) : (

            <>

              <section className="wallet-balance-card">

                <div className="wallet-balance-icon">
                  <Wallet size={28} />
                </div>

                <div>

                  <p className="wallet-balance-label">
                    Available balance
                  </p>

                  <p className="wallet-balance-amount">
                    ₹
                    {formatMoney(
                      wallet?.balance ?? 0,
                    )}
                  </p>

                  {
                    wallet?.updated_at && (

                      <p className="wallet-balance-updated">
                        Last updated:
                        {" "}
                        {new Date(
                          wallet.updated_at,
                        ).toLocaleString()}
                      </p>
                    )
                  }

                </div>

              </section>

              <section className="wallet-txn-section">

                <div className="wallet-txn-head">

                  <h2 className="wallet-txn-title">
                    Transaction history
                  </h2>

                  <div className="wallet-txn-filters">

                    <button
                      type="button"
                      className={
                        filterType === ""
                          ? "wallet-filter-btn wallet-filter-btn--active"
                          : "wallet-filter-btn"
                      }
                      onClick={() => {

                        handleFilterChange(
                          "",
                        );
                      }}
                    >
                      All
                    </button>

                    <button
                      type="button"
                      className={
                        filterType === "credit"
                          ? "wallet-filter-btn wallet-filter-btn--active"
                          : "wallet-filter-btn"
                      }
                      onClick={() => {

                        handleFilterChange(
                          "credit",
                        );
                      }}
                    >
                      Credits
                    </button>

                    <button
                      type="button"
                      className={
                        filterType === "debit"
                          ? "wallet-filter-btn wallet-filter-btn--active"
                          : "wallet-filter-btn"
                      }
                      onClick={() => {

                        handleFilterChange(
                          "debit",
                        );
                      }}
                    >
                      Debits
                    </button>

                  </div>

                </div>

                {
                  txnLoading &&
                  transactions.length === 0 ? (

                    <p className="wallet-muted">
                      Loading transactions…
                    </p>
                  ) : !transactions.length ? (

                    <p className="wallet-empty">
                      {
                        filterType === "credit"
                          ? "No credit transactions yet."
                          : filterType === "debit"
                            ? "No debit transactions yet."
                            : "No transactions yet. Refunds from cancellations and returns will appear here."
                      }
                    </p>
                  ) : (

                    <ul className="wallet-txn-list">

                      {
                        transactions.map(
                          (
                            txn,
                          ) => (

                            <li
                              key={txn.id}
                              className="wallet-txn-item"
                            >

                              <div
                                className={
                                  txn.type === "credit"
                                    ? "wallet-txn-icon wallet-txn-icon--credit"
                                    : "wallet-txn-icon wallet-txn-icon--debit"
                                }
                              >

                                {
                                  txn.type === "credit"
                                    ? (
                                      <ArrowDownLeft size={18} />
                                    )
                                    : (
                                      <ArrowUpRight size={18} />
                                    )
                                }

                              </div>

                              <div className="wallet-txn-body">

                                <p className="wallet-txn-reason">
                                  {txn.reason_display}
                                </p>

                                {
                                  txn.order_number && (

                                    <p className="wallet-txn-meta">
                                      Order
                                      {" "}
                                      {txn.order_number}
                                    </p>
                                  )
                                }

                                {
                                  txn.reference_note && (

                                    <p className="wallet-txn-meta">
                                      {txn.reference_note}
                                    </p>
                                  )
                                }

                                <p className="wallet-txn-date">
                                  {new Date(
                                    txn.created_at,
                                  ).toLocaleString()}
                                </p>

                              </div>

                              <div className="wallet-txn-amounts">

                                <p
                                  className={
                                    txn.type === "credit"
                                      ? "wallet-txn-amount wallet-txn-amount--credit"
                                      : "wallet-txn-amount wallet-txn-amount--debit"
                                  }
                                >

                                  {txnSign(
                                    txn.type,
                                  )}
                                  ₹
                                  {formatMoney(
                                    txn.amount,
                                  )}
                                </p>

                                <p className="wallet-txn-balance-after">
                                  Bal ₹
                                  {formatMoney(
                                    txn.balance_after,
                                  )}
                                </p>

                              </div>

                            </li>
                          ),
                        )
                      }

                    </ul>
                  )
                }

                {
                  pagination.total_pages > 1 && (

                    <div className="wallet-pagination">

                      <button
                        type="button"
                        className="wallet-page-btn"
                        disabled={
                          pagination.current_page <= 1 ||
                          txnLoading
                        }
                        onClick={() => {

                          handlePageChange(
                            pagination.current_page - 1,
                          );
                        }}
                      >
                        Previous
                      </button>

                      <span className="wallet-page-info">
                        Page
                        {" "}
                        {pagination.current_page}
                        {" "}
                        of
                        {" "}
                        {pagination.total_pages}
                      </span>

                      <button
                        type="button"
                        className="wallet-page-btn"
                        disabled={
                          pagination.current_page >=
                            pagination.total_pages ||
                          txnLoading
                        }
                        onClick={() => {

                          handlePageChange(
                            pagination.current_page + 1,
                          );
                        }}
                      >
                        Next
                      </button>

                    </div>
                  )
                }

              </section>

            </>
          )
        }

      </div>

    </AccountLayout>
  );
}
