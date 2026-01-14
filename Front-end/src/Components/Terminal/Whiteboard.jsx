import React, { useState, useEffect, useRef } from 'react';
import { updateWhiteboard, subscribeToWhiteboard, clearWhiteboard } from '../../firebaseService';
import { FaEraser, FaTrash, FaPen } from 'react-icons/fa';

const Whiteboard = ({ roomId }) => {
    const [paths, setPaths] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);
    const [color, setColor] = useState("#ffffff");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const svgRef = useRef(null);

    useEffect(() => {
        if (!roomId) return;
        const unsubscribe = subscribeToWhiteboard(roomId, (data) => {
            setPaths(data);
        });
        return () => unsubscribe();
    }, [roomId]);

    const getCoordinates = (e) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        setCurrentPath([{ x, y }]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        setCurrentPath(prev => [...prev, { x, y }]);
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentPath.length > 1) {
            updateWhiteboard(roomId, {
                points: currentPath,
                color,
                strokeWidth
            });
        }
        setCurrentPath([]);
    };

    const convertPointsToPath = (points) => {
        if (!points || points.length === 0) return "";
        const d = points.map((p, i) =>
            `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
        ).join(" ");
        return d;
    };

    return (
        <div className="relative w-full h-full bg-[#1e1e1e] rounded-xl overflow-hidden cursor-crosshair border border-white/5">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 z-10">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                    title="Color"
                />
                <select
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="bg-black/20 text-white text-xs rounded p-1 outline-none border border-white/10"
                >
                    <option value={2}>Thin</option>
                    <option value={5}>Medium</option>
                    <option value={10}>Thick</option>
                </select>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <button
                    onClick={() => clearWhiteboard(roomId)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                    title="Clear All"
                >
                    <FaTrash />
                </button>
            </div>

            <svg
                ref={svgRef}
                className="w-full h-full touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Remote Paths */}
                {paths.map((p) => (
                    <path
                        key={p.id}
                        d={convertPointsToPath(p.points)}
                        stroke={p.color}
                        strokeWidth={p.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}

                {/* Current Path */}
                {currentPath.length > 1 && (
                    <path
                        d={convertPointsToPath(currentPath)}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.8}
                    />
                )}
            </svg>
        </div>
    );
};

export default Whiteboard;
