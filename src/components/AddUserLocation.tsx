import { useDispatch, useSelector } from "react-redux";
import useSetupLocation from "../hooks/useSetupLocation";
import Modal from "./Modal";
import { MapPin } from "lucide-react";
import type { RootState } from "../store";
import { setOpenAddUserLocationModal } from "../store/user.slice";

const AddUserLocation = () => {
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
          title="Share your location"
          clickOutside={false}
          loading={loadingSetupLocation}
          xlSize="1"
          textButton="Use my location"
          onValidate={async () => {
            await setupLocation();
            dispatch(setOpenAddUserLocationModal(false));
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Find nearby restaurants</span>
            </div>
            <p>
              Share your location to see{" "}
              <span className="text-accent font-medium">restaurants</span> and{" "}
              <span className="text-accent font-medium">dishes</span> near you.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AddUserLocation;
