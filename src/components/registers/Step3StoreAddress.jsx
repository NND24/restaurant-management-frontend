"use client";
import React, { useEffect, useState } from "react";
import MapboxComponent from "../../components/registers/MapboxContainer";
import { toast } from "react-toastify";

const Step3StoreAddress = ({ storeInfo, updateStoreInfo, nextStep, prevStep, inputClass }) => {
  const [locationReady, setLocationReady] = useState(false);
  const [localAddress, setLocalAddress] = useState({
    full_address: "",
    lat: null,
    lon: null,
  });

  // Cờ để kiểm tra đã lấy vị trí mặc định chưa
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync local state với storeInfo khi mount hoặc storeInfo thay đổi
  useEffect(() => {
    if (storeInfo.address) {
      setLocalAddress({
        full_address: storeInfo.address.full_address || "",
        lat: storeInfo.address.lat || null,
        lon: storeInfo.address.lon || null,
      });
    }
  }, [storeInfo.address]);

  // Chỉ lấy vị trí hiện tại khi chưa có dữ liệu trước đó
  useEffect(() => {
    if (hasInitialized) return;
    if (storeInfo.address?.lat && storeInfo.address?.lon) {
      setLocationReady(true);
      setHasInitialized(true);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          const placeName = await fetchPlaceName(longitude, latitude);
          const updatedAddress = { full_address: placeName, lat: latitude, lon: longitude };
          setLocalAddress(updatedAddress);
          updateStoreInfo({ address: updatedAddress });
          setLocationReady(true);
          setHasInitialized(true);
        },
        (error) => {
          console.error("Lỗi lấy vị trí hiện tại:", error);
          setLocationReady(true);
          setHasInitialized(true);
        }
      );
    } else {
      setLocationReady(true);
      setHasInitialized(true);
    }
  }, [storeInfo.address, hasInitialized]);

  const fetchPlaceName = async (lon, lat) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=vi`;
      const res = await fetch(url, {
        headers: { "User-Agent": "your-app-name" },
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data.display_name || "";
    } catch (error) {
      console.error("Error fetching location:", error);
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalAddress((prev) => ({ ...prev, [name]: value }));
    updateStoreInfo({
      address: { ...storeInfo.address, [name]: value },
    });
  };

  const handleLocationSelect = async (lat, lon) => {
    const full_address = await fetchPlaceName(lon, lat);
    const updatedAddress = { full_address, lat, lon };
    setLocalAddress(updatedAddress);
    updateStoreInfo({ address: updatedAddress });
  };

  const handleNextStep = () => {
    const { full_address, lat, lon } = localAddress;
    if (!lat || !lon || !full_address?.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ, bao gồm vị trí trên bản đồ!");
      return;
    }
    nextStep();
  };

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Địa chỉ cửa hàng</h2>
      <div className='bg-gray-50 p-6 rounded-lg shadow'>
        <div>
          <label className='font-medium block mb-1'>Địa chỉ</label>
          <input
            type='text'
            name='full_address'
            placeholder='Số nhà, đường, quận/huyện...'
            value={localAddress.full_address}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <label className='font-medium block mb-2 mt-4'>Chọn vị trí trên bản đồ</label>
        {locationReady ? (
          <MapboxComponent
            currentLatitude={localAddress.lat}
            currentLongitude={localAddress.lon}
            onLocationSelect={handleLocationSelect}
          />
        ) : (
          <p className='text-sm text-gray-500 mt-2'>Đang lấy vị trí của bạn...</p>
        )}

        <div className='flex justify-between mt-10'>
          <button
            type='button'
            onClick={prevStep}
            className='px-6 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500 text-white font-semibold transition'
          >
            Quay lại
          </button>

          <button
            type='button'
            onClick={handleNextStep}
            className='px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3StoreAddress;
