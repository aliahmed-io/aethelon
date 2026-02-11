"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon, Sparkles, Loader2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitButton } from "../SubmitButtons";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThreeDViewer } from "@/components/product/ThreeDViewer";

import { useActionState, useState, useTransition, useEffect } from "react";

import { editProduct, generate3DModel, delete3DModel, checkMeshyStatus, updateProductModel, cancel3DModelGeneration } from "@/app/store/actions";
import { analyzeProductImage } from "@/app/store/dashboard/products/analyze/actions";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "@/lib/utils";
// import { type $Enums, Category } from "@prisma/client"; // Commented out to fix build if types missing
import { productSchema } from "@/lib/zodSchemas";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface iAppProps {
  data: {
    id: string;
    name: string;
    description: string;
    status: any; // $Enums.ProductStatus;
    price: number;
    images: string[];
    categoryId: string;
    mainCategory: any; // $Enums.MainCategory;
    isFeatured: boolean;
    discountPercentage: number;
    modelUrl: string | null;
    meshyStatus: string | null;
    meshyProgress: number | null;
    meshyTaskId: string | null;
    color: string | null;
    style: string | null;
    features: string[];
    tags: string[];
    imageDescription: string | null;
    stockQuantity: number;
    weight: number;
    lowStockThreshold: number;
    sizes: string[];
  };
  categories: any[]; // Category[];
}

export function EditForm({ data, categories }: iAppProps) {
  const [images, setImages] = useState<string[]>(data.images);
  const [sizes, setSizes] = useState<string[]>(data.sizes || []);
  const [lastResult, action] = useActionState(editProduct, undefined);
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleDelete = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  return (
    <form id={form.id} onSubmit={form.onSubmit} action={action}>
      <input type="hidden" name="productId" value={data.id} />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/store/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Edit Product</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            In this form you can update your product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label>Name</Label>
              <Input
                type="text"
                key={fields.name.key}
                name={fields.name.name}
                defaultValue={data.name}
                placeholder="Product Name"
              />
              <p className="text-red-500">{fields.name.errors}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Description</Label>
              <Textarea
                key={fields.description.key}
                name={fields.description.name}
                defaultValue={data.description}
                placeholder="Write your description right here..."
              />
              <p className="text-red-500">{fields.description.errors}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Price</Label>
              <Input
                key={fields.price.key}
                name={fields.price.name}
                defaultValue={data.price}
                type="number"
                placeholder="$55"
                min={1}
              />
              <p className="text-red-500">{fields.price.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Stock Quantity</Label>
              <Input
                key={fields.stockQuantity.key}
                name={fields.stockQuantity.name}
                defaultValue={data.stockQuantity}
                type="number"
                min="0"
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">Units available to sell.</p>
              <p className="text-red-500">{fields.stockQuantity.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Low Stock Threshold</Label>
              <Input
                key={fields.lowStockThreshold.key}
                name={fields.lowStockThreshold.name}
                defaultValue={data.lowStockThreshold}
                type="number"
                min="0"
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">Alert when stock falls below this.</p>
              <p className="text-red-500">{fields.lowStockThreshold.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Weight (lbs)</Label>
              <Input
                key={fields.weight.key}
                name={fields.weight.name}
                defaultValue={data.weight}
                type="number"
                placeholder="1.0"
                step="0.1"
                min={0}
              />
              <p className="text-red-500">{fields.weight.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Discount Percentage</Label>
              <Input
                key={fields.discountPercentage.key}
                name={fields.discountPercentage.name}
                defaultValue={data.discountPercentage}
                type="number"
                placeholder="0"
                min={0}
                max={100}
              />
              <p className="text-red-500">{fields.discountPercentage.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Featured Product</Label>
              <Switch
                key={fields.isFeatured.key}
                name={fields.isFeatured.name}
                defaultChecked={data.isFeatured}
              />
              <p className="text-red-500">{fields.isFeatured.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Status</Label>
              <Select
                key={fields.status.key}
                name={fields.status.name}
                defaultValue={data.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500">{fields.status.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Main Category</Label>
              <Select
                key={fields.mainCategory.key}
                name={fields.mainCategory.name}
                defaultValue={data.mainCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Main Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEN">Men</SelectItem>
                  <SelectItem value="WOMEN">Women</SelectItem>
                  <SelectItem value="KIDS">Kids</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500">{fields.mainCategory.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Sub Category</Label>
              <Select
                key={fields.category.key}
                name={fields.category.name}
                defaultValue={data.categoryId} // This is the ID
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sub Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-red-500">{fields.category.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Images</Label>
              <input
                type="hidden"
                value={images}
                key={fields.images.key}
                name={fields.images.name}
                defaultValue={fields.images.initialValue as any}
              />
              {images.length > 0 ? (
                <div className="flex gap-5">
                  {images.map((image, index) => (
                    <div key={index} className="relative w-[100px] h-[100px]">
                      <Image
                        height={100}
                        width={100}
                        src={image}
                        alt="Product Image"
                        className="w-full h-full object-cover rounded-lg border"
                      />

                      <button
                        onClick={() => handleDelete(index)}
                        type="button"
                        className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
                      >

                        <XIcon className="w-3 h-3" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setImages(res.map((r) => r.url));
                  }}
                  onUploadError={() => {
                    toast.error("Upload failed");
                  }}
                />
              )}
              <p className="text-red-500">{fields.images.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Sizes</Label>
              <input type="hidden" name={fields.sizes.name} value={JSON.stringify(sizes)} />
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "6", "7", "8", "9", "10", "11", "12"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSizes(prev =>
                        prev.includes(size)
                          ? prev.filter(s => s !== size)
                          : [...prev, size]
                      );
                    }}
                    className={cn(
                      "px-3 py-2 text-sm border rounded-md transition-colors",
                      sizes.includes(size)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-red-500">{fields.sizes.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>3D Model</Label>
              <ModelSwitch
                productId={data.id}
                imageUrls={images}
                hasModel={!!data.modelUrl}
                status={data.meshyStatus}
                progress={data.meshyProgress}
                meshyTaskId={data.meshyTaskId}
                modelUrl={data.modelUrl}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>AI Analysis</Label>
              <AiAnalyzeButton productId={data.id} imageUrl={images[0]} />
              <div className="rounded-md border bg-muted/40 text-sm p-3 space-y-2">
                <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Current AI attributes
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold">Color: </span>
                    <span>{data.color || "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Style: </span>
                    <span>{data.style || "—"}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Features: </span>
                  <span>
                    {data.features && data.features.length
                      ? data.features.join(", ")
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Tags: </span>
                  <span>
                    {data.tags && data.tags.length
                      ? data.tags.join(", ")
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Image description: </span>
                  <span className="block mt-1 text-muted-foreground whitespace-pre-wrap">
                    {data.imageDescription || "—"}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </CardContent>
        <CardFooter>
          <SubmitButton text="Save Changes" />
        </CardFooter>
      </Card>

    </form>
  );

}

function ModelSwitch({
  productId,
  imageUrls,
  hasModel,
  status,
  progress,
  meshyTaskId,
  modelUrl
}: {
  productId: string,
  imageUrls: string[],
  hasModel: boolean,
  status: string | null,
  progress: number | null,
  meshyTaskId: string | null,
  modelUrl: string | null
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isGenerating = !!meshyTaskId && (status === "PENDING" || status === "IN_PROGRESS");
  const hasImages = imageUrls && imageUrls.length > 0;
  const [activeTab, setActiveTab] = useState<"none" | "generate" | "upload">("none");
  const [currentModelUrl, setCurrentModelUrl] = useState<string | null>(modelUrl);

  // Polling for status updates
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      checkMeshyStatus(productId).then((res) => {
        if (res && (res.status !== status || res.progress !== progress)) {
          router.refresh();
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isGenerating, productId, status, router, progress]);

  // Sync internal state with props if needed, though mostly relying on props is safer
  useEffect(() => {
    setCurrentModelUrl(modelUrl);
  }, [modelUrl]);

  const handleStop = () => {
    toast("Stop AI generation?", {
      description: "This will stop tracking the current Meshy generation task for this product.",
      action: {
        label: "Stop",
        onClick: () => {
          startTransition(async () => {
            await cancel3DModelGeneration(productId);
            setActiveTab("none");
            router.refresh();
          });
        },
      },
    });
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generate3DModel(productId, imageUrls);
      if (!res.success) {
        toast.error("Failed to start generation");
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    toast("Delete 3D model", {
      description:
        "This will detach the current 3D model from the product. You can upload a new one after deletion.",
      action: {
        label: "Delete",
        onClick: () => {
          startTransition(async () => {
            await delete3DModel(productId);
            setCurrentModelUrl(null);
            setActiveTab("none");
            router.refresh();
          });
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full border rounded-lg p-4 bg-muted/20">
      {/* Hidden input to ensure modelUrl is submitted if it exists, though typically simple updates might be better handled via specific actions or ensuring the form picks it up if it's outside the component state. 
          However, for this specific form which uses z.parse(formData), we rely on the DB state for initial load, but if we upload a NEW one, we need to make sure the server knows. 
          Actually, the uploadToThing uploads and returns a URL. We should probably update the product immediately upon upload complete, OR put it in a hidden input.
          Looking at the EditForm logic, it pulls from `data` which is from DB. 
          Usually better to update DB immediately on upload for file assets like this.
      */}

      {!hasModel && !isGenerating && activeTab === "none" && (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-muted-foreground">Choose how to add a 3D model:</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("upload")}
              className="justify-start"
            >
              Import GLB/GLTF
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setActiveTab("generate")}
              className="justify-start"
            >
              Generate with AI
            </Button>
          </div>
        </div>
      )}

      {/* Generation Mode */}
      {(!hasModel || isGenerating) && (activeTab === "generate" || isGenerating) && (
        <div className="flex flex-col gap-2">
          {!isGenerating && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("none")}
              >
                Change method
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("upload")}
              >
                Import instead
              </Button>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="text-sm">Generate model from images</span>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isPending || !hasImages || isGenerating}
              type="button"
            >
              {isGenerating ? "Generating..." : "Start Generation"}
            </Button>
            {isGenerating && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleStop}
                disabled={isPending}
                className="h-9 w-9"
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Stop generating</span>
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Status: {status} {progress ? `(${progress}%)` : ""}</span>
            </div>
          )}
          {!hasImages && (
            <p className="text-xs text-red-500">Upload images above to enable AI generation.</p>
          )}
        </div>
      )}

      {/* Upload Mode */}
      {(!hasModel && !isGenerating) && activeTab === "upload" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("none")}
            >
              Change method
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("generate")}
            >
              Generate with AI instead
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Upload a .glb or .gltf file (Max 32MB)</span>
            <UploadDropzone
              endpoint="modelUploader"
              onBeforeUploadBegin={(files) => {
                const first = files?.[0];
                if (!first) return files;

                const sizeMb = first.size / (1024 * 1024);
                if (sizeMb <= 15) return files;

                toast.warning("Large 3D model selected", {
                  description: `${sizeMb.toFixed(1)}MB file. Smaller models load faster and improve page performance. (Max 32MB)`,
                  duration: 7000,
                });

                return files;
              }}
              onClientUploadComplete={async (files) => {
                const file = files?.[0];
                if (!file?.url) {
                  toast.error("Upload failed: no file URL returned.");
                  return;
                }

                startTransition(async () => {
                  try {
                    setCurrentModelUrl(file.url);
                    await updateProductModel(productId, file.url);
                    router.refresh();
                    toast.success("3D model uploaded and attached to product.");
                  } catch (err: any) {
                    console.error(err);
                    toast.error(err?.message || "Failed to save model URL.");
                  }
                });
              }}
              onUploadError={(err) => {
                console.error(err);
                toast.error(err.message || "Upload failed");
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Files are uploaded via UploadThing and linked to this product’s 3D viewer.
          </p>
        </div>
      )}

      {/* Existing Model Display */}
      {(hasModel || currentModelUrl) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-green-500/10 p-3 rounded-md border border-green-500/20 text-green-700 dark:text-green-300">
            <div className="flex-1 text-sm font-medium flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              3D Model Active
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle>3D Model Preview</DialogTitle>
                </DialogHeader>
                <div className="w-full h-full min-h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <ThreeDViewer modelUrl={currentModelUrl!} images={imageUrls} />
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="h-8"
            >
              Delete
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">To change the model, delete the current one first.</p>
        </div>
      )}

      {status === "FAILED" && !hasModel && !isGenerating && (
        <div className="text-xs text-red-500">
          Generation failed. Try manual upload or regenerate.
        </div>
      )}
    </div>
  );
}


function AiAnalyzeButton({ productId, imageUrl }: { productId: string, imageUrl: string }) {
  const [isAnalyzing, startTransition] = useTransition();
  const router = useRouter();

  const handleAnalyze = () => {
    if (!imageUrl) {
      toast.error("Please upload an image first.");
      return;
    }

    startTransition(async () => {
      const res = await analyzeProductImage(productId, imageUrl);
      if (res.success) {
        toast.success("AI tags applied to product.");
        router.refresh();
      } else {
        toast.error(res.error || "Image analysis failed. Please try again.");
      }
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleAnalyze}
      disabled={isAnalyzing || !imageUrl}
      className="w-full gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing Image...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Auto-Tag with AI
        </>
      )}
    </Button>
  );
}