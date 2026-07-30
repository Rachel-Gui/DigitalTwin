import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AIR_QUALITY_TABLEAU_URL } from "../data/tableauEmbed";

const TABLEAU_V3_SCRIPT =
  "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
const BASE_WIDTH = 1000;
const BASE_HEIGHT = 827;

export default function AirQualityTableau({ compact = false, showGuidance = false }) {
  const vizRef = useRef(null);
  const scaleHostRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [scale, setScale] = useState(compact ? 0.82 : 1);

  useLayoutEffect(() => {
    if (!compact) return undefined;

    const updateScale = () => {
      const availableWidth = scaleHostRef.current?.parentElement?.clientWidth ?? BASE_WIDTH;
      const availableHeight = Math.min(window.innerHeight * 0.72, 695);
      const nextScale = Math.min(
        availableWidth / BASE_WIDTH,
        availableHeight / BASE_HEIGHT,
        0.84,
        1
      );
      setScale(Math.max(nextScale, 0.28));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (scaleHostRef.current?.parentElement) {
      observer.observe(scaleHostRef.current.parentElement);
    }
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [compact]);

  useEffect(() => {
    const viz = vizRef.current;
    const handleReady = () => setIsReady(true);
    const handleError = (event) => {
      console.error("Tableau visualization load error", event);
      setHasError(true);
    };

    viz?.addEventListener("firstinteractive", handleReady);
    viz?.addEventListener("vizloaderror", handleError);

    let script = document.querySelector(`script[src="${TABLEAU_V3_SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.type = "module";
      script.src = TABLEAU_V3_SCRIPT;
      script.addEventListener("error", handleError);
      document.head.appendChild(script);
    }

    return () => {
      viz?.removeEventListener("firstinteractive", handleReady);
      viz?.removeEventListener("vizloaderror", handleError);
    };
  }, []);

  return (
    <section
      id="air-quality-dashboard"
      className={`air-quality-tableau-section${compact ? " compact" : ""}`}
      aria-labelledby={compact ? undefined : "air-quality-tableau-title"}
      aria-label={compact ? "PM2.5 prediction and visualization dashboard" : undefined}
    >
      <div className="page-container">
        {!compact && <header className="section-header">
          <div>
            <p className="eyebrow">Interactive dashboard</p>
            <h2 id="air-quality-tableau-title">
              PM2.5 Prediction and Visualization
            </h2>
            <p>
              The dashboard presents project air-quality model outputs and
              spatial patterns at neighborhood and grid scales.
            </p>
          </div>
        </header>}

        <div
          ref={scaleHostRef}
          className="tableau-embed-frame"
          style={{
            width: `${BASE_WIDTH * scale}px`,
            height: `${BASE_HEIGHT * scale}px`
          }}
        >
          <div
            className="tableau-scale-canvas"
            style={{ transform: `scale(${scale})` }}
          >
            {!isReady && !hasError && (
              <div className="tableau-loading" role="status">
                <span aria-hidden="true" />
                Loading the interactive Tableau dashboard…
              </div>
            )}

            {hasError ? (
              <div className="tableau-error" role="alert">
                <h3>The dashboard could not be loaded.</h3>
                <p>
                  Tableau Public may be unavailable or blocked by the current
                  network. Open the visualization directly to try again.
                </p>
                <a
                  href={AIR_QUALITY_TABLEAU_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Tableau ↗
                </a>
              </div>
            ) : (
              <tableau-viz
                ref={vizRef}
                src={AIR_QUALITY_TABLEAU_URL}
                width="1000"
                height="827"
                device="desktop"
                toolbar="bottom"
                hide-tabs=""
              />
            )}
          </div>
        </div>
        {compact && showGuidance && <div
          className="air-reading-callout"
          style={{ width: `${BASE_WIDTH * scale}px` }}
        >
          <span className="eyebrow">How to read this view</span>
          <p>This dashboard presents modeled estimates rather than live sensor readings. Check the legend, units, spatial resolution, and time period before comparing locations. Sensor records represent observed conditions at specific locations, while prediction models estimate patterns between those locations.</p>
        </div>}

        {!compact && <div className="tableau-source-caption">
          <div>
            <span>Source</span>
            <p>
              DecarbCityTwin Air Quality Prediction Module. Visualization
              hosted on Tableau Public.
            </p>
          </div>
          <div>
            <span>Status</span>
            <p>Interactive project dashboard.</p>
          </div>
          <a
            href={AIR_QUALITY_TABLEAU_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Tableau ↗
          </a>
        </div>}
      </div>
    </section>
  );
}
