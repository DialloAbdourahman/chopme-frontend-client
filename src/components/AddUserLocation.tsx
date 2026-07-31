import { useDispatch, useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import useSetupLocation from "../hooks/useSetupLocation";
import Modal from "./Modal";
import { MapPin } from "lucide-react";
import type { RootState } from "../store";
import { setOpenAddUserLocationModal } from "../store/user.slice";

const AddUserLocation = () => {
  const { t } = useTranslation();
  const { setupLocation, loadingSetupLocation } = useSetupLocation();
  const { openAddUserLocationModal } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useDispatch();

  return (
    <>
      {openAddUserLocationModal && (
        <Modal
          open={openAddUserLocationModal}
          setOpen={(value) =>
            dispatch(
              setOpenAddUserLocationModal(
                typeof value === "function"
                  ? value(openAddUserLocationModal)
                  : value,
              ),
            )
          }
          title={t("addUserLocation.title")}
          clickOutside={false}
          loading={loadingSetupLocation}
          xlSize="1"
          textButton={t("addUserLocation.useMyLocation")}
          onValidate={async () => {
            await setupLocation();
            dispatch(setOpenAddUserLocationModal(false));
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">
                {t("addUserLocation.findNearby")}
              </span>
            </div>
            <p>
              <Trans
                i18nKey="addUserLocation.description"
                components={[
                  <span className="text-accent font-medium" />,
                  <span className="text-accent font-medium" />,
                ]}
              />
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AddUserLocation;
