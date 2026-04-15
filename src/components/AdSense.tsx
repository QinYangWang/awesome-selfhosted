import { useEffect, useRef } from "react";

// Placeholder AdSense component
export function AdSenseHorizontal() {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle) {
        // @ts-ignore
        window.adsbygoogle.push({});
      }
    } catch {}
  }, []);

  return (
    <div className="my-4 w-full flex justify-center">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", maxWidth: 728, height: 90 }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="1111111111"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
