import { Button } from "@/components/ui-library/Button";
import { Input } from "@/components/ui-library/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui-library/Card";
import { Label } from "@/components/ui-library/Label";
import { Textarea } from "@/components/ui-library/Textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-library/Table";
import { Badge } from "@/components/ui-library/Badge";
import { Navbar } from "@/components/ui-library/Navbar";
import { Sidebar } from "@/components/ui-library/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui-library/Dialog";
import { MockChart } from "@/components/ui-library/MockChart";
import { Heading } from "@/components/ui-library/Heading";
import { Text } from "@/components/ui-library/Text";
import * as Icons from "@/components/ui-library/Icons";

export interface RegistryItem {
  component: any;
  subComponents?: Record<string, any>;
  description: string;
  props?: Record<string, string>;
  path: string;
}

export const COMPONENT_REGISTRY: Record<string, RegistryItem> = {
  Button: {
    component: Button,
    description: "A button component for user actions.",
    path: "components/ui-library/Button",
    props: {
      variant: "default | destructive | outline | secondary | ghost | link",
      size: "default | sm | lg | icon",
      onClick: "() => void",
      children: "ReactNode",
    },
  },
  Input: {
    component: Input,
    description: "An input field for user text input.",
    path: "components/ui-library/Input",
    props: {
      type: "text | password | email | number",
      placeholder: "string",
      value: "string",
      onChange: "(e) => void",
    },
  },
  Card: {
    component: Card,
    subComponents: {
      CardHeader,
      CardTitle,
      CardDescription,
      CardContent,
      CardFooter,
    },
    description:
      "A container for content with a header, content area, and footer.",
    path: "components/ui-library/Card",
  },
  Badge: {
    component: Badge,
    description: "A small status indicator or label.",
    path: "components/ui-library/Badge",
    props: {
      variant: "default | secondary | destructive | outline",
    },
  },
  Table: {
    component: Table,
    subComponents: {
      TableHeader,
      TableBody,
      TableFooter,
      TableHead,
      TableRow,
      TableCell,
      TableCaption,
    },
    description: "A table for displaying structured data.",
    path: "components/ui-library/Table",
  },
  Navbar: {
    component: Navbar,
    description: "A top navigation bar.",
    path: "components/ui-library/Navbar",
    props: {
      children: "ReactNode",
    },
  },
  Sidebar: {
    component: Sidebar,
    description: "A side navigation bar.",
    path: "components/ui-library/Sidebar",
    props: {
      children: "ReactNode",
    },
  },
  Dialog: {
    component: Dialog,
    subComponents: {
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
    },
    description: "A modal dialog overlay.",
    path: "components/ui-library/Dialog",
    props: {
      open: "boolean",
      onOpenChange: "(open: boolean) => void",
    },
  },
  MockChart: {
    component: MockChart,
    description: "A visual placeholder charts for dashboards.",
    path: "components/ui-library/MockChart",
  },
  Heading: {
    component: Heading,
    description: "Typography for page titles and section headers.",
    path: "components/ui-library/Heading",
    props: {
      level: "1 | 2 | 3 | 4 | 5 | 6",
      children: "ReactNode",
    },
  },
  Text: {
    component: Text,
    description: "Typography for body text.",
    path: "components/ui-library/Text",
    props: {
      variant: "default | lead | large | small | muted",
      children: "ReactNode",
    },
  },
};

export type ComponentName = keyof typeof COMPONENT_REGISTRY;
