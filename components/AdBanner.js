import { useEffect } from 'react';

const AdBanner = ({ adSlot }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', margin: '20px 0' }}
      data-ad-client="ca-pub-6458731678804828"
      data-ad-slot={adSlot} // replace with your Ad unit ID
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdBanner;
