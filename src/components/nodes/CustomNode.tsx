import { NodeProps, Position, Handle } from "reactflow";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function CustomNode({ data }: NodeProps) {
  return (
    <div>
      <Handle position={Position.Top} type="target" />
      <div
        style={{
          width: "180px", // Fixed width
          height: "50px", // Fixed height
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Adjusts spacing between label and icon
          overflow: "hidden", // Hide overflow
        }}
      >
        <div
          style={{
            flex: 1, // Takes up available space
            display: "flex", // Enables centering
            alignItems: "center", // Centers vertically
            justifyContent: "center", // Centers horizontally
          }}
        >
          <div
            style={{
              wordWrap: "break-word", // Allow text to wrap onto next line
              flexShrink: 1, // Allow this div to shrink if necessary
              minWidth: 0, // Allow this div to shrink below its content's intrinsic width
              fontSize: "0.8em", // Slightly smaller font size
              lineHeight: "1.2em", // Line height to ensure text is well-spaced
              maxHeight: "2.4em", // Maximum height to limit text to two lines
              overflow: "hidden", // Hide any text that exceeds the maximum height
              textAlign: "center", // Ensures text is centered
            }}
          >
            {data.label}
          </div>
        </div>
        {data.expandable && (
          <div style={{ paddingRight: "10px" }}>
            {" "}
            {/* Adds padding to the right of the icon */}
            {data.expanded ? <FaChevronDown /> : <FaChevronRight />}
          </div>
        )}
      </div>
      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}
