import useSetupLocation from "../hooks/useSetupLocation";
import Modal from "./Modal";
import { MapPin } from "lucide-react";

type Props = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddUserLocation = ({ setShowModal, showModal }: Props) => {
  const { setupLocation, loadingSetupLocation } = useSetupLocation();

  return (
    <>
      {showModal && (
        <Modal
          open={showModal}
          setOpen={setShowModal}
          title="Share your location"
          clickOutside={false}
          loading={loadingSetupLocation}
          xlSize="1"
          textButton="Use my location"
          onValidate={async () => {
            await setupLocation();
            setShowModal(false);
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
