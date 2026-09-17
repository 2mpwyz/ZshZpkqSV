import React from "react";
import { PlusCircle, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import FileUploadZone, {
  FileAttachment,
} from "../../../../components/FileUploadZone";
import TaskCreationTipsSidebar from "./TaskCreationTipsSidebar";

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

interface ChecklistItem {
  text: string;
}

interface Assignee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  service_type: string;
}

interface TaskCreationFormProps {
  formData: FormData;
  fileAttachments: FileAttachment[];
  selectedComplaint: any;
  internalStaff: Assignee[];
  externalVendors: Assignee[];
  isSubmitting: boolean;
  onFormChange: (field: string, value: string | string[]) => void;
  onAddAttachments: (attachments: FileAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
  onCreateTask: () => void;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  formData,
  fileAttachments,
  selectedComplaint,
  internalStaff,
  externalVendors,
  isSubmitting,
  onFormChange,
  onAddAttachments,
  onRemoveAttachment,
  onCreateTask,
}) => {
  const handleAddChecklistItem = () => {
    const updatedChecklist = [...(formData.checklist || []), ""];
    onFormChange("checklist", updatedChecklist);
  };

  const handleChecklistChange = (index: number, value: string) => {
    const updatedChecklist = [...(formData.checklist || [])];
    updatedChecklist[index] = value;
    onFormChange("checklist", updatedChecklist);
  };

  const handleRemoveChecklistItem = (index: number) => {
    const updatedChecklist = (formData.checklist || []).filter(
      (_, i) => i !== index
    );
    onFormChange("checklist", updatedChecklist);
  };

  const handleToggleEvidenceType = (evidenceType: string) => {
    const currentTypes = formData.evidenceTypes || [];
    const updatedTypes = currentTypes.includes(evidenceType)
      ? currentTypes.filter((t) => t !== evidenceType)
      : [...currentTypes, evidenceType];
    onFormChange("evidenceTypes", updatedTypes);
  };

  return (
    <Card data-task-form>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-sheraton-gold" />
          Create New Task
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Create a task and assign it to internal staff or external vendors
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g., Fix HVAC System"
                value={formData.title}
                onChange={(e) => onFormChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Detailed task description..."
                rows={4}
                value={formData.description}
                onChange={(e) => onFormChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => onFormChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => onFormChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assignment Type *</Label>
                <Select
                  value={formData.assignmentType}
                  onValueChange={(value) => onFormChange("assignmentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Staff</SelectItem>
                    <SelectItem value="external">External Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign To *</Label>
                <Select
                  value={formData.assignee}
                  onValueChange={(value) => onFormChange("assignee", value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.assignmentType
                          ? "Select assignee"
                          : "First select assignment type"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.assignmentType === "internal" &&
                      internalStaff.length > 0 &&
                      internalStaff.map((staff) => (
                        <SelectItem
                          key={staff.id}
                          value={`${staff.first_name} ${staff.last_name} - ${staff.service_type}`}
                        >
                          {staff.first_name} {staff.last_name} (
                          {staff.service_type})
                        </SelectItem>
                      ))}
                    {formData.assignmentType === "external" &&
                      externalVendors.length > 0 &&
                      externalVendors.map((vendor) => (
                        <SelectItem
                          key={vendor.id}
                          value={`${vendor.first_name} ${vendor.last_name} - ${vendor.service_type}`}
                        >
                          {vendor.first_name} {vendor.last_name} (
                          {vendor.service_type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.assignmentType === "internal" &&
                  internalStaff.length === 0 && (
                    <p className="text-sm text-orange-600">
                      No internal staff available. Create staff profiles first.
                    </p>
                  )}
                {formData.assignmentType === "external" &&
                  externalVendors.length === 0 && (
                    <p className="text-sm text-orange-600">
                      No external vendors available. Create vendor profiles first.
                    </p>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => onFormChange("dueDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Estimated Time</Label>
                <Select
                  value={formData.estimatedTime}
                  onValueChange={(value) => onFormChange("estimatedTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 min">30 minutes</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="8 hours">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Terms (for external vendors)</Label>
              <Input
                placeholder="e.g., 50% upfront, balance upon completion"
                value={formData.paymentTerms}
                onChange={(e) => onFormChange("paymentTerms", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Budget Allocation</Label>
              <Input
                type="number"
                placeholder="e.g., 500.00"
                value={formData.budget}
                onChange={(e) => onFormChange("budget", e.target.value)}
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                The budget allocated to complete this task
              </p>
            </div>

            {/* Checklist Section */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Task Checklist (Optional)
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddChecklistItem}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {(formData.checklist || []).length > 0 ? (
                <div className="space-y-2">
                  {formData.checklist.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Checklist item ${index + 1}`}
                        value={item}
                        onChange={(e) =>
                          handleChecklistChange(index, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveChecklistItem(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No checklist items yet. Add items to help the service provider
                  track task completion.
                </p>
              )}
            </div>

            {/* Evidence Requirements Section */}
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-base font-semibold">
                Evidence/Proof Requirements (Optional)
              </Label>
              <p className="text-sm text-gray-600">
                Select what types of evidence the service provider must submit
                to prove task completion
              </p>

              <div className="space-y-2">
                {["photo", "video", "document"].map((evidenceType) => (
                  <div key={evidenceType} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`evidence-${evidenceType}`}
                      checked={(formData.evidenceTypes || []).includes(
                        evidenceType
                      )}
                      onChange={() => handleToggleEvidenceType(evidenceType)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 cursor-pointer"
                    />
                    <Label
                      htmlFor={`evidence-${evidenceType}`}
                      className="capitalize cursor-pointer flex-1 font-normal"
                    >
                      {evidenceType}
                      {evidenceType === "photo" && " (images/screenshots)"}
                      {evidenceType === "video" && " (video recordings)"}
                      {evidenceType === "document" &&
                        " (documents/files/signatures)"}
                    </Label>
                  </div>
                ))}
              </div>

              {(formData.evidenceTypes || []).length > 0 && (
                <div className="p-2 bg-white rounded border border-green-200">
                  <p className="text-xs font-semibold text-gray-700">
                    Required:
                  </p>
                  <p className="text-sm text-green-700">
                    {formData.evidenceTypes.join(", ")}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Attachments & Media</Label>
              <FileUploadZone
                attachments={fileAttachments}
                onAddAttachments={(newAttachments) =>
                  onAddAttachments(newAttachments)
                }
                onRemoveAttachment={(id) => onRemoveAttachment(id)}
                maxFiles={10}
                maxSizeMB={50}
              />
              {selectedComplaint && fileAttachments.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  ✓ {fileAttachments.length} attachment(s) from complaint
                  auto-populated
                </p>
              )}
            </div>

            <Button
              onClick={onCreateTask}
              disabled={isSubmitting}
              className="w-full sheraton-gradient text-white hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating Task..." : "Create & Send Task"}
            </Button>
          </div>

          {/* Sidebar */}
          <TaskCreationTipsSidebar />
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCreationForm;
