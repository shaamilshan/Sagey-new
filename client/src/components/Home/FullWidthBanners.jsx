import React from "react";
import banner1 from "../../assets/1nw.png"; // adjust path as per your folder
import banner2 from "../../assets/2nw.png";
import banner3 from "../../assets/3nw.png";

const FullWidthBanners = () => {
  const banners = [banner1];

  return (
    <div className="w-full">
      {banners.map((src, idx) => (
        <div
          key={idx}
          className="w-full aspect-[16/9]">
          <img
            src={src}
            alt={`Banner ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default FullWidthBanners;
