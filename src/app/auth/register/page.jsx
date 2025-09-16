"use client";
import React, { useEffect, useState } from "react";
import StepRegister from "@/components/fragment/StepRegister";
import Step1OwnerAccount from "@/components/registers/Step1OwnerAccount";
import Step2BasicStoreInfo from "@/components/registers/Step2BasicStoreInfo";
import Step3StoreAddress from "@/components/registers/Step3StoreAddress";
import Step4Paperwork from "@/components/registers/Step4Paperwork";
import Step5Confirm from "@/components/registers/Step5Confirm";
// import các bước tiếp theo nếu có

const RegisterPage = () => {
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    owner: {
      name: "",
      email: "",
      password: "",
      phonenumber: "",
      gender: "",
    },
    store: {
      name: "",
      description: "",
      storeCategory: [],
      avatar: "",
      cover: "",
      address: {
        full_address: "",
        lat: "",
        lon: "",
      },
    },
    paperWork: {
      IC_front: null,
      IC_back: null,
      businessLicense: null,
      storePicture: [],
    },
    ownerId: null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    console.log("📝 formData cập nhật:", formData);
  }, [formData]);

  const renderStepComponent = () => {
    switch (step) {
      case 0:
        return (
          <Step1OwnerAccount
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        );
      case 1:
        return (
          <Step2BasicStoreInfo
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2:
        return (
          <Step3StoreAddress
            storeInfo={formData.store}
            updateStoreInfo={(updatedAddress) =>
              setFormData((prev) => ({
                ...prev,
                store: {
                  ...prev.store,
                  address: {
                    ...prev.store.address,
                    ...updatedAddress.address, // truyền đúng address object
                  },
                },
              }))
            }
            nextStep={nextStep}
            prevStep={prevStep}
            inputClass="w-full p-2 border rounded mt-1"
          />
        );
      case 3:
        return (
          <Step4Paperwork
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <Step5Confirm
            formData={formData}
            prevStep={prevStep}
            // Có thể thêm submitStore nếu muốn gửi
          />
        );
      default:
        return <div>Không tìm thấy bước phù hợp</div>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-200 px-4 py-8">
      
      <h1 className="text-3xl font-bold text-center mb-8">Đăng ký cửa hàng</h1>

      {/* Step Progress */}
      <StepRegister currentStep={step} />

      {/* Form Step */}
      <div className="mt-8">{renderStepComponent()}</div>
    </div>
  );
};

export default RegisterPage;
