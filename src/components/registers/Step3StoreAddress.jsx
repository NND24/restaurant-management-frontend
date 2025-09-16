import React, { useEffect, useState } from "react";
import MapboxComponent from "../../components/registers/MapboxContainer";
import { toast } from "react-toastify";
const Step3StoreAddress = ({
  storeInfo,
  updateStoreInfo,
  registerStore,
  nextStep,
  prevStep,
  inputClass,
}) => {
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          console.log("Vị trí hiện tại:", latitude, longitude);
          updateStoreInfo({
            address: {
              ...storeInfo.address,
              lat: latitude,
              lon: longitude,
            },
          });
          setLocationReady(true); // Mark location is ready
        },
        (error) => {
          console.error("Lỗi lấy vị trí hiện tại:", error);
          setLocationReady(true); // Still show map even if user denies access
        }
      );
    } else {
      setLocationReady(true);
    }
  }, []); // Empty dependency array to run once

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateStoreInfo({
      address: {
        ...storeInfo.address,
        [name]: value,
      },
    });
  };

  const handleLocationSelect = (lat, lng) => {
    updateStoreInfo({
      address: {
        ...storeInfo.address,
        lat: lat,
        lon: lng,
      },
    });
  };

  const validateStep = () => {
    return (
      storeInfo?.address?.full_address &&
      storeInfo?.address?.lat &&
      storeInfo?.address?.lon
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Địa chỉ cửa hàng</h2>
      <div className="bg-gray-50 p-6 rounded-lg shadow">
        <div>
          <label className="font-medium block mb-1">Địa chỉ</label>
          <input
            type="text"
            name="full_address"
            placeholder="Số nhà, đường, quận/huyện..."
            value={storeInfo?.address?.full_address || ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <label className="font-medium block mb-2 mt-4">
          Chọn vị trí trên bản đồ
        </label>

        {locationReady ? (
          <MapboxComponent
            currentLatitude={storeInfo?.address?.lat}
            currentLongitude={storeInfo?.address?.lon}
            onLocationSelect={handleLocationSelect}
          />
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            Đang lấy vị trí của bạn...
          </p>
        )}
        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={prevStep}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Quay lại
          </button>

          <button
            type="button"
            onClick={async () => {
              if (validateStep()) {
                // await registerStore();
                nextStep();
              } else {
                toast.error("Vui lòng điền đầy đủ thông tin!");
              }
            }}
            className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            Tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3StoreAddress;
