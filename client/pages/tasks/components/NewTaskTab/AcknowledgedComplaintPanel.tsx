import React from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import AttachmentList from "../../../../components/AttachmentList";
import { Complaint, FileAttachment } from "../../../../lib/supabase";

interface AcknowledgedComplaintPanelProps {
  complaint: Complaint;
  complaintAttachments: Map<string, FileAttachment[]>;
  onClose: () => void;
}

const AcknowledgedComplaintPanel: React.FC<AcknowledgedComplaintPanelProps> = ({
  complaint,
  complaintAttachments,
  onClose,
}) => {
  return (
    <Card className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <CheckCircle className="h-5 w-5" />
              Acknowledged Complaint
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              This complaint will be converted to a task below
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Issue Type</p>
            <p className="font-semibold text-sheraton-navy">
              {complaint.complaint_type}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Priority</p>
            <Badge
              className={`capitalize ${
                complaint.priority === "urgent"
                  ? "bg-red-500"
                  : complaint.priority === "high"
                    ? "bg-orange-500"
                    : complaint.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
              }`}
            >
              {complaint.priority}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Guest Name</p>
          <p className="font-semibold text-sheraton-navy">{complaint.guest_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Room Number</p>
            <p className="font-semibold text-sheraton-navy">
              {complaint.room_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Filed Date</p>
            <p className="font-semibold text-sheraton-navy">
              {new Date(complaint.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
            {complaint.description}
          </p>
        </div>

        {complaint.email && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Guest Email</p>
            <p className="text-sm text-gray-600">{complaint.email}</p>
          </div>
        )}

        {complaintAttachments.get(complaint.id) &&
          complaintAttachments.get(complaint.id)!.length > 0 && (
            <div className="pt-4 border-t border-orange-200">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                Attachments
              </p>
              <AttachmentList
                attachments={complaintAttachments.get(complaint.id)!}
                compact={false}
              />
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default AcknowledgedComplaintPanel;
