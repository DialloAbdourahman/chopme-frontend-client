import { useState } from "react";
import { KEYS } from "../utils/keys";

type Props = {
  name: string;
  coverImage?: string;
  pictures: string[];
};

const RestaurantGallery = ({ name, coverImage, pictures }: Props) => {
  const images = [
    ...(coverImage ? [coverImage] : []),
    ...(pictures ?? []),
  ].map((img) => `${KEYS.PUBLIC_S3_PREFIX}/${img}`);

  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-56 sm:h-72 bg-gray-200 flex items-center justify-center rounded-b-3xl">
        <span className="text-gray-400 text-sm">No image available</span>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-56 sm:h-72 overflow-hidden">
        <img
          src={images[selected]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                selected === i ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantGallery;
