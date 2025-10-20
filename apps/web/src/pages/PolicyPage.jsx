import { Link } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/register">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registration {/* Updated to English */}
          </Button>
        </Link>

        <Card className="shadow-lg rounded-2xl border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800">
                  Privacy Policy & Terms of Service
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  PharmaFlow Privacy & Terms Policy
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-0 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to PharmaFlow - Smart Inventory and Sales Management
                System. By registering and using our service, you agree to
                comply with the terms and policies outlined in this document.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Terms of Use
              </h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                When using PharmaFlow, you commit to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>
                  Provide accurate and complete information during registration
                </li>
                <li>Keep your login credentials secure</li>
                <li>Use the system for lawful purposes only</li>
                <li>Comply with pharmaceutical management regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We are committed to protecting your personal information. Your
                data is encrypted and stored securely. We do not share your
                information with third parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. Rights and Responsibilities
              </h2>
              <p className="text-gray-600 leading-relaxed">
                PharmaFlow provides an inventory and sales management platform.
                Users are responsible for the accuracy of data entered into the
                system and compliance with laws related to pharmaceutical
                business operations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. Contact
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this policy, please contact us
                via email: support@pharmaflow.com
              </p>
            </section>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString("en-US")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
