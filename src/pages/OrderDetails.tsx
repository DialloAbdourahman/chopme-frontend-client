import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Utensils,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import {
  EnumOrderStatus,
  EnumStatusCode,
  EnumStatusResponse,
  type IOrderEntity,
  type IMenuEntity,
  type IRestaurantEntity,
  type IOrchestrationResult,
} from "chopme-frontend-common";
import { AxiosError } from "axios";
import Navbar from "../components/Navbar";
import DeleteModal from "../components/DeleteModal";
import OrderStatusBadge from "../components/OrderStatusBadge";
import RefundStatusBadge from "../components/RefundStatusBadge";
import { OrderService } from "../services/order.service";
import { RestaurantService } from "../services/restaurant.service";
import { MenuService } from "../services/menu.service";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";
import { ComputeUtils } from "../utils/compute-utils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setOrderStatusUpdate } from "../store/notification.slice";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate("/orders");
    }
  };

  const dispatch = useDispatch();

  const { orderStatusUpdate } = useSelector(
    (state: RootState) => state.notification,
  );

  const [order, setOrder] = useState<IOrderEntity | null>(null);
  const [restaurant, setRestaurant] = useState<IRestaurantEntity | null>(null);
  const [menus, setMenus] = useState<Record<string, IMenuEntity>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = useCallback(async (): Promise<boolean> => {
    if (!orderId) {
      setError("Invalid order");
      setLoading(false);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const orderRes = await OrderService.findOne(orderId);
      if (
        orderRes.data.code === EnumStatusResponse.SUCCESS &&
        orderRes.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
        orderRes.data.data
      ) {
        const orderData = orderRes.data.data;
        setOrder(orderData);

        try {
          const restaurantRes = await RestaurantService.findOne(
            orderData.restaurantId,
          );
          if (
            restaurantRes.data.code === EnumStatusResponse.SUCCESS &&
            restaurantRes.data.statusCode ===
              EnumStatusCode.RECOVERED_SUCCESSFULLY &&
            restaurantRes.data.data
          ) {
            setRestaurant(restaurantRes.data.data);
          }
        } catch {
          showErrorToast("Failed to load restaurant details");
        }

        const menusMap: Record<string, IMenuEntity> = {};
        await Promise.all(
          orderData.items.map(async (item) => {
            try {
              const menuRes = await MenuService.findOne(item.productId);
              if (
                menuRes.data.code === EnumStatusResponse.SUCCESS &&
                menuRes.data.statusCode ===
                  EnumStatusCode.RECOVERED_SUCCESSFULLY &&
                menuRes.data.data
              ) {
                menusMap[item.productId] = menuRes.data.data;
              }
            } catch {
              // Ignore individual menu failures
            }
          }),
        );
        setMenus(menusMap);
        return true;
      } else {
        const message = orderRes.data.message ?? "Order not found";
        setError(message);
        showWarningToast(message);
        return false;
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.RESTAURANT_NOT_FOUND:
          setError("Restaurant not found.");
          showWarningToast("Restaurant not found.");
          break;

        case EnumStatusCode.ONE_OF_THE_MENUS_DOES_NOT_EXIST:
          setError("One or more items were not found.");
          showWarningToast("One or more items were not found.");
          break;

        case EnumStatusCode.ORDER_NOT_FOUND:
        case EnumStatusCode.NOT_FOUND:
          setError("Order not found.");
          showWarningToast("Order not found.");
          break;
        case EnumStatusCode.VALIDATION_ERROR:
          setError("Please check the order information and try again.");
          showWarningToast("Please check the order information and try again.");
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          setError("Something went wrong. Please try again.");
          showErrorToast("Something went wrong. Please try again.");
          break;
        default:
          const message =
            err.response?.data?.message ??
            "Something went wrong. Please try again.";
          setError(message);
          showErrorToast(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const handlePay = async () => {
    if (!order || !orderId) return;

    if (
      order.paymentDetails?.link &&
      order.paymentDetails?.validUntil &&
      new Date(order.paymentDetails.validUntil) > new Date()
    ) {
      window.location.href = order.paymentDetails.link;
      return;
    }

    setIsPaying(true);
    try {
      const res = await OrderService.pay(orderId);
      if (
        res.data.code === EnumStatusResponse.SUCCESS &&
        res.data.statusCode === EnumStatusCode.PAYMENT_INITIATED &&
        res.data.data
      ) {
        window.location.href = res.data.data.url;
      } else {
        showWarningToast(res.data.message ?? "Could not start payment.");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.ORDER_NOT_FOUND:
          showWarningToast("Order not found.");
          break;
        case EnumStatusCode.ORDER_CANNOT_BE_PAID:
          showWarningToast(
            "Order can only be paid when it is in Created status.",
          );
          break;
        case EnumStatusCode.PAYMENT_TIME_EXPIRED:
          showWarningToast("Payment deadline has passed.");
          break;
        case EnumStatusCode.CLIENT_NOT_FOUND:
          showWarningToast("Client not found. Please sign in again.");
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          showErrorToast("Something went wrong. Please try again.");
          break;
        default:
          showErrorToast(
            err.response?.data?.message ??
              "Something went wrong. Please try again.",
          );
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!order || !orderId) return;

    setIsCancelling(true);
    try {
      const res = await OrderService.cancel(orderId);
      if (
        res.data.code === EnumStatusResponse.SUCCESS &&
        res.data.statusCode === EnumStatusCode.CANCELLED_SUCCESSFULLY &&
        res.data.data
      ) {
        setOrder(res.data.data);
        showSuccessToast("Order cancelled");
      } else {
        showWarningToast(res.data.message ?? "Could not cancel order.");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.ORDER_NOT_FOUND:
          showWarningToast("Order not found.");
          break;
        case EnumStatusCode.ORDER_CANNOT_BE_UPDATED:
          showWarningToast(
            "Order can only be cancelled when it is in Created status.",
          );
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          showErrorToast("Something went wrong. Please try again.");
          break;
        default:
          showErrorToast(
            err.response?.data?.message ??
              "Something went wrong. Please try again.",
          );
      }
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleRefresh = async () => {
    if (!orderId) return;
    await fetchOrder();
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!orderStatusUpdate || orderStatusUpdate.id !== order?.id) return;

    setOrder(orderStatusUpdate);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
          <div className="h-8 w-32 bg-card rounded-xl animate-pulse" />
          <div className="h-32 bg-card rounded-2xl animate-pulse" />
          <div className="h-48 bg-card rounded-2xl animate-pulse" />
          <div className="h-64 bg-card rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
            <p className="text-text font-semibold">
              {error ?? "Order not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <ShoppingBag size={22} className="text-primary" />
            Order details
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || isPaying || isCancelling}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-50 transition-colors"
              aria-label="Refresh order"
            >
              <RefreshCw size={18} />
            </button>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {order.status === EnumOrderStatus.CANCELLED_BY_RESTAURANT && (
          <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-red-700">
                Order cancelled by restaurant
              </p>
              {order.refundStatus && (
                <RefundStatusBadge status={order.refundStatus} />
              )}
            </div>
            {order.cancelledAt && (
              <p className="text-xs text-red-600/80 mt-0.5">
                Cancelled at {ComputeUtils.formatDate(order.cancelledAt)}
              </p>
            )}
            {order.orderCancelReason && (
              <p className="text-xs text-red-600/80 mt-0.5">
                Reason:{" "}
                {ComputeUtils.formatCancelledReason(order.orderCancelReason)}
              </p>
            )}
          </div>
        )}

        {restaurant && (
          <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              From
            </p>
            <p className="text-sm font-semibold text-text">{restaurant.name}</p>
            {restaurant.address && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin size={12} />
                {restaurant.address.city}, {restaurant.address.country}
              </p>
            )}
            <p className="text-xs text-primary mt-1">
              {order.distanceKm.toFixed(2)} km away
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4 mb-4">
          <h2 className="text-sm font-semibold text-text">Items</h2>
          {order.items.map((item) => {
            const menu = menus[item.productId];
            const unitPrice = item.priceWithPlatformPercentage ?? 0;
            const lineTotal = unitPrice * item.quantity;

            return (
              <div
                key={item.productId}
                className="flex items-center gap-4 border-b border-gray-100 last:border-0 pb-4 last:pb-0"
              >
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
                  <Utensils size={20} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">
                    {menu?.name ?? "Menu item"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text">
                    {lineTotal.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-gray-500">
                    {unitPrice.toLocaleString()} FCFA each
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-sm space-y-2 mb-4">
          <h2 className="text-sm font-semibold text-text mb-2">Pricing</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm font-medium text-text">
              {order.pricing.totalAmountCollected.toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Delivery</span>
            <span className="text-sm font-medium text-text">
              {order.pricing.deliveryFeeAmountWithCollectionAndDisbursementPercentage.toLocaleString()}{" "}
              FCFA
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-text">
              {order.pricing.totalAmountCollectedWithDelivery.toLocaleString()}{" "}
              FCFA
            </span>
          </div>
        </div>

        {(order.status === EnumOrderStatus.CREATED ||
          order.status === EnumOrderStatus.PAYMENT_INITIATED) && (
          <button
            onClick={handlePay}
            disabled={isPaying || isCancelling}
            className={`w-full mb-3 bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:animate-none ${
              order.status === EnumOrderStatus.CREATED ? "animate-bounce" : ""
            }`}
          >
            <CreditCard size={18} />
            {isPaying
              ? "Starting payment..."
              : order.status === EnumOrderStatus.CREATED
                ? "Pay for your order now"
                : "Finalize payment"}
          </button>
        )}

        {order.status === EnumOrderStatus.CREATED && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isPaying || isCancelling}
            className="w-full mb-4 bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            Cancel order
          </button>
        )}

        {order.paidAt && (
          <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-sm font-semibold text-text">Paid at</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ComputeUtils.formatDate(order.paidAt)}
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-text mb-4">
            Order history
          </h2>
          <div className="relative pl-4 space-y-6">
            <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200" />
            {order.statusTransitions.map((transition, index) => (
              <div key={index} className="relative">
                <span
                  className={`absolute -left-[11px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                    index === order.statusTransitions.length - 1
                      ? "bg-primary"
                      : "bg-gray-300"
                  }`}
                />
                <p className="text-sm font-medium text-text">
                  {ComputeUtils.formatStatus(transition.status)}
                </p>
                <p className="text-xs text-gray-500">
                  {ComputeUtils.formatDate(transition.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DeleteModal
        open={showCancelModal}
        setOpen={setShowCancelModal}
        title="Cancel your order?"
        description="This action cannot be undone."
        loading={isCancelling}
        confirmText="Cancel order"
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default OrderDetails;
