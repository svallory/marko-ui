// Hand-authored prose + example ordering for /docs/components/file-upload.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A dropzone and file picker for uploading files, with drag-and-drop and a list of accepted files.",
  importSnippet: `import FileUpload from "@/components/ui/file-upload/file-upload.marko";`,
  usageSnippet: `<FileUpload filesChange(files) { ... }/>`,
  examples: [
    {
      name: "file-upload-demo",
      title: "Basic",
      description: "Drag and drop files onto the dropzone, or click browse to pick them.",
    },
    {
      name: "file-upload-accept",
      title: "Accepted file types",
      description: "Pass `accept` to restrict file types and `maxFiles` to cap how many can be selected.",
    },
    {
      name: "file-upload-max-size",
      title: "Max file size",
      description: "Pass `maxFileSize` (in bytes) to reject files above a size limit.",
    },
    {
      name: "file-upload-controlled",
      title: "Change callback",
      description: "Use `filesChange` to read the accepted files whenever the selection changes.",
    },
  ],
};
