"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { questionsApi } from "@/lib/api/questions"
import { Loader2, Upload, FileText, Download } from "lucide-react"
import type { AxiosError } from "axios"

interface ImportQuestionsModalProps {
  isOpen: boolean
  onClose: () => void
  testId: string
  testType: "test" | "live" | "daily"
  testTitle: string
  onSuccess: () => void
}

export function ImportQuestionsModal({
  isOpen,
  onClose,
  testId,
  testType,
  testTitle,
  onSuccess,
}: ImportQuestionsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()
console.log(testId)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await questionsApi.importFromFile(testId, testType, selectedFile)

      toast({
        title: "Import successful",
        description: `${result.questions.length} questions imported and translated successfully.`,
      })

      onSuccess()
      onClose()
      setSelectedFile(null)
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>
      const errorMessage = axiosError.response?.data?.error || "Failed to import questions"

      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,subject,topic,exam,previousYear,year,difficulty
"What is 2 + 2?","2","3","4","5","4","Basic addition: 2 + 2 equals 4","Mathematics","Arithmetic","SSC,UPSC",false,2023,easy
"What is the capital of India?","Mumbai","Delhi","Kolkata","Chennai","Delhi","Delhi is the capital city of India","General Knowledge","Geography","UPSC",true,2022,medium`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "questions_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] bg-slate-400">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Questions
          </DialogTitle>
          <DialogDescription>
            Import questions from CSV/Excel file for "{testTitle}". Questions will be automatically translated to Hindi
            using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Import Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Test:</span>
                <span className="font-medium">{testTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{testType} Test</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Translation:</span>
                <span className="font-medium">English → Hindi (AI Powered)</span>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            </div>

            {selectedFile && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Template Download */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV Template
              </CardTitle>
              <CardDescription>Download a sample CSV template with the required format.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* Required Columns */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Required Columns</CardTitle>
              <CardDescription>Your CSV/Excel file must include these columns:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <p>
                    <strong>questionText</strong> - Question text
                  </p>
                  <p>
                    <strong>optionA</strong> - First option
                  </p>
                  <p>
                    <strong>optionB</strong> - Second option
                  </p>
                  <p>
                    <strong>optionC</strong> - Third option
                  </p>
                  <p>
                    <strong>optionD</strong> - Fourth option
                  </p>
                  <p>
                    <strong>correctAnswer</strong> - Correct answer
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <strong>explanation</strong> - Answer explanation
                  </p>
                  <p>
                    <strong>subject</strong> - Subject name
                  </p>
                  <p>
                    <strong>topic</strong> - Topic name
                  </p>
                  <p>
                    <strong>exam</strong> - Exam types (comma-separated)
                  </p>
                  <p>
                    <strong>difficulty</strong> - easy/medium/hard
                  </p>
                  <p>
                    <strong>previousYear</strong> - true/false
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !selectedFile}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Importing & Translating..." : "Import Questions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
