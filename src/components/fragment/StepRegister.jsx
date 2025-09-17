import React from "react";

const steps = [
  { title: "Tạo tài khoản", description: "Tài khoản chủ cửa hàng" },
  { title: "Thông tin cửa hàng", description: "Thông tin cơ bản" },
  { title: "Địa chỉ", description: "Vị trí cửa hàng" },
  { title: "Hồ sơ", description: "Giấy tờ pháp lý & một số ảnh" },
  { title: "Xác nhận", description: "Hoàn tất đăng ký cửa hàng" },
];

const StepRegister = ({ currentStep = 0, vertical = false }) => {
  return (
    <ol className={`flex gap-1 ${vertical ? "flex-col items-start" : "flex-row justify-between items-center"}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <li key={index} className={`${vertical ? "relative last:mb-0" : "flex-1 flex items-center"}`}>
            <div className={`flex ${vertical ? "items-start gap-4" : "items-center gap-2"} relative`}>
              {/* Circle + Line container */}
              <div className='flex flex-col items-center'>
                {/* Circle */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "border-orange-600 bg-orange-100 text-orange-600"
                      : isCompleted
                      ? "border-orange-600 bg-orange-600 text-white"
                      : "border-gray-300 text-gray-500 bg-white"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Vertical Line */}
                {vertical && index < steps.length - 1 && <div className={`w-1 h-12 bg-gray-300 mt-2`} />}
              </div>

              {/* Text */}
              <div className='ml-4'>
                <div
                  className={`font-semibold ${
                    isActive ? "text-orange-600" : isCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
                <div
                  className={`text-sm ${
                    isActive ? "text-orange-600" : isCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default StepRegister;
