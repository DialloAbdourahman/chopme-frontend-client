import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { setCart } from "../store/cart";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      setError(t("order.invalidOrder"));
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
          showErrorToast(t("order.failedToLoadRestaurantDetails"));
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
        const message = orderRes.data.message ?? t("order.orderNotFound");
        setError(message);
        showWarningToast(message);
        return false;
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.RESTAURANT_NOT_FOUND:
          setError(t("order.restaurantNotFound"));
          showWarningToast(t("order.restaurantNotFound"));
          break;

        case EnumStatusCode.ONE_OF_THE_MENUS_DOES_NOT_EXIST:
          setError(t("order.itemsNotFound"));
          showWarningToast(t("order.itemsNotFound"));
          break;

        case EnumStatusCode.ORDER_NOT_FOUND:
        case EnumStatusCode.NOT_FOUND:
          setError(t("order.orderNotFound"));
          showWarningToast(t("order.orderNotFound"));
          break;
        case EnumStatusCode.VALIDATION_ERROR:
          setError(t("order.checkOrderInformation"));
          showWarningToast(t("order.checkOrderInformation"));
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          setError(t("common.somethingWentWrong"));
          showErrorToast(t("common.somethingWentWrong"));
          break;
        default:
          const message =
            err.response?.data?.message ?? t("common.somethingWentWrong");
          setError(message);
          showErrorToast(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const handleRetryOrder = () => {
    if (!order || !restaurant) return;

    dispatch(
      setCart({
        restaurantId: order.restaurantId,
        restaurantName: restaurant.name,
        items: order.items.map((item) => ({
          menuId: item.productId,
          quantity: item.quantity,
        })),
      }),
    );
    navigate("/checkout");
  };

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
        showWarningToast(res.data.message ?? t("order.couldNotStartPayment"));
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.ORDER_NOT_FOUND:
          showWarningToast(t("order.orderNotFound"));
          break;
        case EnumStatusCode.ORDER_CANNOT_BE_PAID:
          showWarningToast(t("order.orderCanOnlyBePaidWhenCreated"));
          break;
        case EnumStatusCode.PAYMENT_TIME_EXPIRED:
          showWarningToast(t("order.paymentDeadlinePassed"));
          break;
        case EnumStatusCode.CLIENT_NOT_FOUND:
          showWarningToast(t("order.clientNotFound"));
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          showErrorToast(t("common.somethingWentWrong"));
          break;
        default:
          showErrorToast(
            err.response?.data?.message ?? t("common.somethingWentWrong"),
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
        showSuccessToast(t("order.orderCancelled"));
      } else {
        showWarningToast(res.data.message ?? t("order.couldNotCancelOrder"));
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.ORDER_NOT_FOUND:
          showWarningToast(t("order.orderNotFound"));
          break;
        case EnumStatusCode.ORDER_CANNOT_BE_UPDATED:
          showWarningToast(t("order.orderCanOnlyBeCancelledWhenCreated"));
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          showErrorToast(t("common.somethingWentWrong"));
          break;
        default:
          showErrorToast(
            err.response?.data?.message ?? t("common.somethingWentWrong"),
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
      case EnumOrderStatus.PAID:
        showSuccessToast(t("order.paymentSuccessful"));
        break;
      case EnumOrderStatus.PAYMENT_FAILED:
        showErrorToast(t("order.paymentFailed"));
        break;
      case EnumOrderStatus.CANCELLED_BY_RESTAURANT:
        showWarningToast(t("order.restaurantCancelledOrder"));
        break;
      case EnumOrderStatus.PREPARING_ORDER:
        showSuccessToast(t("order.restaurantPreparingOrder"));
        break;
      case EnumOrderStatus.IN_DELIVERY:
        showSuccessToast(t("order.orderOutForDelivery"));
        break;
      case EnumOrderStatus.DELIVERED:
        showSuccessToast(t("order.orderDelivered"));
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
          <Link
            to={"/orders"}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            {t("common.back")}
          </Link>
          <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
            <p className="text-text font-semibold">
              {error ?? t("order.orderNotFound")}
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
        <Link
          to={"/orders"}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          {t("common.back")}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <ShoppingBag size={22} className="text-primary" />
            {t("order.orderDetails")}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || isPaying || isCancelling}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-50 transition-colors"
              aria-label={t("order.refreshOrder")}
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
                {t("order.orderCancelledByRestaurant")}
              </p>
              {order.refundStatus && (
                <RefundStatusBadge status={order.refundStatus} />
              )}
            </div>
            {order.cancelledAt && (
              <p className="text-xs text-red-600/80 mt-0.5">
                {t("order.cancelledAt")}{" "}
                {ComputeUtils.formatDate(order.cancelledAt)}
              </p>
            )}
            {order.orderCancelReason && (
              <p className="text-xs text-red-600/80 mt-0.5">
                {t("order.reason")}{" "}
                {ComputeUtils.formatCancelledReason(t, order.orderCancelReason)}
              </p>
            )}
          </div>
        )}

        {restaurant && (
          <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              {t("order.from")}
            </p>
            <p className="text-sm font-semibold text-text">{restaurant.name}</p>
            {restaurant.address && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin size={12} />
                {restaurant.address.city}, {restaurant.address.country}
              </p>
            )}
            <p className="text-xs text-primary mt-1">
              {t("order.kmAway", { distance: order.distanceKm.toFixed(2) })}
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4 mb-4">
          <h2 className="text-sm font-semibold text-text">
            {t("order.items")}
          </h2>
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
                    {menu?.name ?? t("order.menuItem")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("order.quantity", { qty: item.quantity })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text">
                    {lineTotal.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("order.priceEach", {
                      price: unitPrice.toLocaleString(),
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-sm space-y-2 mb-4">
          <h2 className="text-sm font-semibold text-text mb-2">
            {t("order.pricing")}
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{t("order.subtotal")}</span>
            <span className="text-sm font-medium text-text">
              {order.pricing.totalAmountCollected.toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{t("order.delivery")}</span>
            <span className="text-sm font-medium text-text">
              {order.pricing.deliveryFeeAmountWithCollectionAndDisbursementPercentage.toLocaleString()}{" "}
              FCFA
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500">{t("order.total")}</span>
            <span className="text-lg font-bold text-text">
              {order.pricing.totalAmountCollectedWithDelivery.toLocaleString()}{" "}
              FCFA
            </span>
          </div>
        </div>

        {((order.status === EnumOrderStatus.CREATED &&
          order.maxTimeToPayOrder &&
          new Date(order.maxTimeToPayOrder) > new Date()) ||
          (order.status === EnumOrderStatus.PAYMENT_INITIATED &&
            order.paymentDetails?.link &&
            order.paymentDetails?.validUntil &&
            new Date(order.paymentDetails.validUntil) > new Date())) && (
          <button
            onClick={handlePay}
            disabled={isPaying || isCancelling}
            className={`w-full mb-3 bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:animate-none ${
              order.status === EnumOrderStatus.CREATED ? "animate-bounce" : ""
            }`}
          >
            <CreditCard size={18} />
            {isPaying
              ? t("order.startingPayment")
              : order.status === EnumOrderStatus.CREATED
                ? t("order.payNow")
                : t("order.finalizePayment")}
          </button>
        )}

        {order.status === EnumOrderStatus.CREATED && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isPaying || isCancelling}
            className="w-full mb-4 bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {t("order.cancelOrder")}
          </button>
        )}

        {(order.status === EnumOrderStatus.PAYMENT_FAILED ||
          order.status === EnumOrderStatus.CANCELLED_BY_RESTAURANT ||
          order.status === EnumOrderStatus.CANCELLED_BY_CUSTOMER ||
          (order.status === EnumOrderStatus.CREATED &&
            order.maxTimeToPayOrder &&
            new Date() > new Date(order.maxTimeToPayOrder)) ||
          (order.status === EnumOrderStatus.PAYMENT_INITIATED &&
            order.paymentDetails?.link &&
            order.paymentDetails?.validUntil &&
            new Date() > new Date(order.paymentDetails.validUntil))) && (
          <button
            onClick={handleRetryOrder}
            disabled={isPaying || isCancelling}
            className="w-full mb-3 bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:animate-none animate-bounce"
          >
            <RefreshCw size={18} />
            {t("order.retryOrder")}
          </button>
        )}

        {order.paidAt && (
          <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-sm font-semibold text-text">
              {t("order.paidAtTitle")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {ComputeUtils.formatDate(order.paidAt)}
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-text mb-4">
            {t("order.orderHistory")}
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
                  {ComputeUtils.formatStatus(t, transition.status)}
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
        title={t("order.cancelYourOrder")}
        description={t("common.cannotUndo")}
        loading={isCancelling}
        confirmText={t("order.cancelOrder")}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default OrderDetails;
