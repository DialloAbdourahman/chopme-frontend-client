import { io, type Socket } from "socket.io-client";
import { KEYS } from "../utils/keys";
import { TokensService } from "../services/tokens.service";
import type { RootState } from "../store";
import {
  EnumNotificationType,
  EnumOrderStatus,
  EnumWebSocketEventType,
  playNotificationSound,
  type INotification,
  type IOrderEntity,
} from "chopme-frontend-common";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setNewNotification } from "../store/notification.slice";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";

const WebSocket = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleReceivedNotification = (newNotification: INotification<any>) => {
    dispatch(setNewNotification(newNotification));
    playNotificationSound();

    if (newNotification.type === EnumNotificationType.ORDER_STATUS_CHANGED) {
      const notification = newNotification as INotification<IOrderEntity>;
      switch (notification.data.status) {
        case EnumOrderStatus.PAID:
          showSuccessToast(t("notification.paymentSuccessful"));
          break;
        case EnumOrderStatus.PAYMENT_FAILED:
          showErrorToast(t("notification.paymentFailed"));
          break;
        case EnumOrderStatus.CANCELLED_BY_RESTAURANT:
          showWarningToast(t("notification.restaurantCancelledOrder"));
          break;
        case EnumOrderStatus.PREPARING_ORDER:
          showSuccessToast(t("notification.restaurantPreparingOrder"));
          break;
        case EnumOrderStatus.IN_DELIVERY:
          showSuccessToast(t("notification.orderOutForDelivery"));
          break;
        case EnumOrderStatus.DELIVERED:
          showSuccessToast(t("notification.orderDelivered"));
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const token = TokensService.getToken(KEYS.ACCESS_TOKEN_KEY);

    if (!token || !user) {
      return;
    }

    const socket: Socket = io(KEYS.WEB_SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on(
      EnumWebSocketEventType.CLIENT_APPLICATION,
      (data: INotification<any>) => {
        handleReceivedNotification(data);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return <></>;
};

export default WebSocket;
