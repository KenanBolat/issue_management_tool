import React from "react";
import { toast } from "react-toastify";

export function showConfirmToast(message) {
    return new Promise((resolve) => {
        const toastId = toast.info(
            ({ closeToast }) => (
                <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: "10px" }}>{message}</div>

                    <button
                        style={{
                            marginRight: "10px",
                            padding: "6px 14px",
                            background: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            position:"top-center"

                        }}
                        onClick={() => {
                            resolve(true);
                            toast.dismiss(toastId);
                        }}
                    >
                        Evet
                    </button>

                    <button
                        style={{
                            padding: "6px 14px",
                            background: "#d9534f",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                        onClick={() => {
                            resolve(false);
                            toast.dismiss(toastId);
                        }}
                    >
                        Hayır
                    </button>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
            }
        );
    });
}
