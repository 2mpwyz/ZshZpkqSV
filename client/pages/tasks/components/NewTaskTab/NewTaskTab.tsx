import React from "react";
import { Loader } from "lucide-react";
import { TabsContent } from "../../../../components/ui/tabs";
import { Card, CardContent } from "../../../../components/ui/card";
import OpenComplaintsSection from "./OpenComplaintsSection";
import AcknowledgedComplaintPanel from "./AcknowledgedComplaintPanel";
import TaskCreationForm from "./TaskCreationForm";
import { Complaint, FileAttachment } from "../../../../lib/supabase";

interface FormData {
  title: string;
  description: string;
  priority: string;
  category: string;
  assignmentType: string;
  assignee: string;
  dueDate: string;
  estimatedTime: string;
  paymentTerms: string;
  budget: string;
  checklist: string[];
  evidenceTypes: string[];
}

interface Assignee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  service_type: string;
}

interface NewTaskTabProps {
  isLoading: boolean;
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  complaintAttachments: Map<string, FileAttachment[]>;
  formData: FormData;
  fileAttachments: FileAttachment[];
  isSubmitting: boolean;
  internalStaff: Assignee[];
  externalVendors: Assignee[];
  onSelectComplaint: (complaint: Complaint) => void;
  onAcceptComplaint: (complaint: Complaint) => void;
  onFormChange: (field: string, value: string | string[]) => void;
  onAddAttachments: (attachments: FileAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
  onCreateTask: () => void;
  onClearSelectedComplaint: () => void;
}

const NewTaskTab: React.FC<NewTaskTabProps> = ({
  isLoading,
  complaints,
  selectedComplaint,
  complaintAttachments,
  formData,
  fileAttachments,
  isSubmitting,
  internalStaff,
  externalVendors,
  onSelectComplaint,
  onAcceptComplaint,
  onFormChange,
  onAddAttachments,
  onRemoveAttachment,
  onCreateTask,
  onClearSelectedComplaint,
}) => {
  return (
    <TabsContent value="new-task" className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <Card className="border-2 border-dashed border-sheraton-gold bg-sheraton-cream">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <Loader className="h-12 w-12 text-sheraton-gold animate-spin" />
            </div>
            <p className="text-muted-foreground">Loading tasks and complaints...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && (
        <>
          {/* Open Complaints Section */}
          {complaints.length > 0 && (
            <OpenComplaintsSection
              complaints={complaints}
              selectedComplaint={selectedComplaint}
              complaintAttachments={complaintAttachments}
              isSubmitting={isSubmitting}
              onSelectComplaint={onSelectComplaint}
              onAcceptComplaint={onAcceptComplaint}
            />
          )}

          {complaints.length === 0 && (
            <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30">
              <CardContent className="p-8 text-center">
                <div className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No open complaints at this time
                </p>
              </CardContent>
            </Card>
          )}

          {/* Acknowledged Complaint Panel */}
          {selectedComplaint && (
            <AcknowledgedComplaintPanel
              complaint={selectedComplaint}
              complaintAttachments={complaintAttachments}
              onClose={onClearSelectedComplaint}
            />
          )}

          {/* Task Creation Form */}
          <TaskCreationForm
            formData={formData}
            fileAttachments={fileAttachments}
            selectedComplaint={selectedComplaint}
            internalStaff={internalStaff}
            externalVendors={externalVendors}
            isSubmitting={isSubmitting}
            onFormChange={onFormChange}
            onAddAttachments={onAddAttachments}
            onRemoveAttachment={onRemoveAttachment}
            onCreateTask={onCreateTask}
          />
        </>
      )}
    </TabsContent>
  );
};

export default NewTaskTab;
