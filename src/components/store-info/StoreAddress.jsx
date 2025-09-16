"use client";
import React, { useState } from "react";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa";
import MapBoxComponent from "../../components/registers/MapboxContainer";

const StoreAddress = ({ address, onUpdateAddress }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempAddress, setTempAddress] = useState(address.full_address);
  const [tempLat, setTempLat] = useState(address.lat);
  const [tempLon, setTempLon] = useState(address.lon);

  const handleLocationSelect = (lat, lon) => {
    setTempLat(lat);
    setTempLon(lon);
  };

  const handleSave = () => {
    onUpdateAddress({
      full_address: tempAddress,
      lat: tempLat,
      lon: tempLon,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempAddress(address.full_address);
    setTempLat(address.lat);
    setTempLon(address.lon);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-full space-y-6 rounded-xl bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Địa chỉ</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800"
            title="Chỉnh sửa"
          >
            <FaPen />
          </button>
        )}
      </div>

      {isEditing ? (
        <>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={tempAddress}
            onChange={(e) => setTempAddress(e.target.value)}
          />

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="font-bold text-gray-700">Vĩ độ</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={tempLat}
                onChange={(e) => setTempLat(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="font-bold text-gray-700">Kinh độ</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={tempLon}
                onChange={(e) => setTempLon(e.target.value)}
              />
            </div>
          </div>

          {/* MapBox component */}
          <MapBoxComponent
            currentLatitude={parseFloat(tempLat)}
            currentLongitude={parseFloat(tempLon)}
            onLocationSelect={handleLocationSelect}
          />

          <div className="flex justify-end gap-4 mt-2">
            <button
              className="text-green-600 hover:text-green-800"
              onClick={handleSave}
              title="Lưu"
            >
              <FaCheck />
            </button>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={handleCancel}
              title="Hủy"
            >
              <FaTimes />
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="text"
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3"
            value={address.full_address}
          />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="font-bold text-gray-700">Vĩ độ</label>
              <input
                type="text"
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3"
                value={address.lat}
              />
            </div>
            <div className="w-full">
              <label className="font-bold text-gray-700">Kinh độ</label>
              <input
                type="text"
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3"
                value={address.lon}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoreAddress;
