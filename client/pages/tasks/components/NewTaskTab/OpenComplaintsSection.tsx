import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import AttachmentList from "../../../../components/AttachmentList";
import { Complaint, FileAttachment } from "../../../../lib/supabase";

interface OpenComplaintsSectionProps {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  complaintAttachments: Map<string, FileAttachment[]>;
  isSubmitting: boolean;
  onSelectComplaint: (complaint: Complaint) => void;
  onAcceptComplaint: (complaint: Complaint) => void;
}

const OpenComplaintsSection: React.FC<OpenComplaintsSectionProps> = ({
  complaints,
  selectedComplaint,
  complaintAttachments,
  isSubmitting,
  onSelectComplaint,
  onAcceptComplaint,
}) => {
  if (complaints.length === 0) {
    return (
      <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-10 w-10 text-orange-600 mx-auto mb-3" />
          <p className="text-muted-foreground">No open complaints at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Open Complaints to Convert
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Select a complaint below to create a task to resolve it
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className={`p-4 border rounded-lg transition-all ${
                selectedComplaint?.id === complaint.id
                  ? "border-orange-500 bg-orange-100 shadow-md"
                  : "border-orange-200 hover:border-orange-400"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sheraton-navy">
                  {complaint.complaint_type}
                </h4>
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
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {complaint.description}
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Guest:</strong> {complaint.guest_name}
                </p>
                <p>
                  <strong>Room:</strong> {complaint.room_number}
                </p>
                <p>
                  <strong>Filed:</strong>{" "}
                  {new Date(complaint.created_at).toLocaleDateString()}
                </p>
              </div>
              {complaintAttachments.get(complaint.id) &&
                complaintAttachments.get(complaint.id)!.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <AttachmentList
                      attachments={complaintAttachments.get(complaint.id)!}
                      compact={true}
                    />
                  </div>
                )}
              <Button
                size="sm"
                onClick={() => onAcceptComplaint(complaint)}
                disabled={isSubmitting}
                className="mt-3 w-full bg-orange-600 text-white hover:bg-orange-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {selectedComplaint?.id === complaint.id
                  ? "Acknowledged"
                  : "Accept & Acknowledge"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenComplaintsSection;
