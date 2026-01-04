import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-xl border border-red-200">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <AlertTriangle className="h-8 w-8" />
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                        </div>
                        <p className="text-gray-600 mb-6">
                            The application crashed. Please send the following error details to your developer.
                        </p>

                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-6 max-h-64 text-sm font-mono text-gray-800">
                            <strong>Error:</strong> {this.state.error?.toString()}
                            <br />
                            <br />
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
