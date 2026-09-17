import React from "react";
import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

const TaskCreationTipsSidebar: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-sheraton-cream to-white border-sheraton-gold border-2">
        <CardHeader>
          <CardTitle className="text-base text-sheraton-navy flex items-center gap-2">
            <Flag className="h-5 w-5 text-sheraton-gold" />
            Task Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div className="p-3 bg-white rounded-lg border-l-4 border-l-sheraton-gold">
            <p className="font-semibold text-sheraton-navy mb-1">
              Clear Instructions
            </p>
            <p className="text-gray-600 text-xs">
              Provide detailed descriptions with expected outcomes
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-l-sheraton-gold">
            <p className="font-semibold text-sheraton-navy mb-1">
              Realistic Deadlines
            </p>
            <p className="text-gray-600 text-xs">
              Allow adequate time for quality work
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-l-sheraton-gold">
            <p className="font-semibold text-sheraton-navy mb-1">
              Payment Terms
            </p>
            <p className="text-gray-600 text-xs">
              Be clear about payment schedules for external work
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCreationTipsSidebar;
