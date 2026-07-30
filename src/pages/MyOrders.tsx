import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  EnumOrderStatus,
  EnumStatusCode,
  EnumStatusResponse,
  type IOrderEntity,
} from "chopme-frontend-common";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import OrderStatusBadge from "../components/OrderStatusBadge";
import RefundStatusBadge from "../components/RefundStatusBadge";
import { OrderService } from "../services/order.service";
import { RestaurantService } from "../services/restaurant.service";
import { ComputeUtils } from "../utils/compute-utils";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";
import type { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { setOrderStatusUpdate } from "../store/notification.slice";

const LIMIT = 10;

const statusOptions = [
  { value: "", label: "All" },
  ...Object.values(EnumOrderStatus).map((status) => ({
    value: status,
    label: ComputeUtils.formatStatus(status),
  })),
];

const MyOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { orderStatusUpdate } = useSelector(
    (state: RootState) => state.notification,
  );

  const dispatch = useDispatch();

  const [orders, setOrders] = useState<IOrderEntity[]>([]);
  const [restaurantNames, setRestaurantNames] = useState<
    Record<string, string>
  >({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleStatusChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }
    setSearchParams(nextParams);
    setPage(1);
  };

  const status = searchParams.get("status") ?? "";

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await OrderService.getMyOrders({
          status: status || undefined,
          page,
          limit: LIMIT,
        });

        if (
          data.code === EnumStatusResponse.SUCCESS &&
          data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          data.data
        ) {
          const orderItems = data.data.items;
          setOrders(orderItems);
          setTotalPages(data.data.totalPages);

          const uniqueRestaurantIds = [
            ...new Set(orderItems.map((order) => order.restaurantId)),
          ];
          const names: Record<string, string> = {};
          await Promise.all(
            uniqueRestaurantIds.map(async (id) => {
              try {
                const res = await RestaurantService.findOne(id);
                if (
                  res.data.code === EnumStatusResponse.SUCCESS &&
                  res.data.statusCode ===
                    EnumStatusCode.RECOVERED_SUCCESSFULLY &&
                  res.data.data
                ) {
                  names[id] = res.data.data.name;
                }
              } catch {
                // Ignore missing restaurant names
              }
            }),
          );
          setRestaurantNames(names);
        } else {
          showErrorToast(data.message ?? "Could not load orders.");
        }
      } catch {
        showErrorToast("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, page]);

  useEffect(() => {
    if (!orderStatusUpdate) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderStatusUpdate.id ? orderStatusUpdate : order,
      ),
    );

    switch (orderStatusUpdate.status) {
      case EnumOrderStatus.CANCELLED_BY_RESTAURANT:
        showWarningToast("The restaurant cancelled your order.");
        break;
      case EnumOrderStatus.PREPARING_ORDER:
        showSuccessToast("The restaurant is preparing your order.");
        break;
      case EnumOrderStatus.IN_DELIVERY:
        showSuccessToast("Your order is out for delivery.");
        break;
      case EnumOrderStatus.DELIVERED:
        showSuccessToast("Your order has been delivered.");
        break;
      default:
        break;
    }

    dispatch(setOrderStatusUpdate(null));
  }, [orderStatusUpdate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <ShoppingBag size={22} className="text-primary" />
            My orders
          </h1>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full sm:w-auto bg-card border border-border text-text text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              const isCancelled =
                order.status === EnumOrderStatus.CANCELLED_BY_RESTAURANT ||
                order.status === EnumOrderStatus.CANCELLED_BY_CUSTOMER;

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingBag
                      size={18}
                      className="text-primary sm:w-5 sm:h-5"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-text truncate">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 text-right shrink-0">
                        {ComputeUtils.formatDate(order.createdAt)}
                      </p>
                    </div>

                    <p className="text-xs text-text/80 truncate">
                      {restaurantNames[order.restaurantId] ?? "Restaurant"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-text">
                          {order.pricing.totalAmountCollectedWithDelivery.toLocaleString()}{" "}
                          FCFA
                        </p>
                        <span className="text-xs text-gray-500">
                          • {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <OrderStatusBadge status={order.status} />
                        {isCancelled && order.refundStatus && (
                          <RefundStatusBadge status={order.refundStatus} />
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={20}
                    className="text-gray-400 shrink-0 self-center hidden sm:block"
                  />
                </button>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-10 w-10 min-w-[2.5rem] inline-flex items-center justify-center rounded-full bg-card text-text disabled:opacity-50 hover:bg-gray-100 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-text">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="h-10 w-10 min-w-[2.5rem] inline-flex items-center justify-center rounded-full bg-card text-text disabled:opacity-50 hover:bg-gray-100 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
