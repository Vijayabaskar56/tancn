import { BookingForm as BookingFormComp } from "@/registry/react/booking-form";
import { CheckboxForm } from "@/registry/react/checkbox-field";
import { ContacUsForm } from "@/registry/react/contactu-form";
import { DatePickerForm } from "@/registry/react/date-picker-field";
import { EventRegistrationForm } from "@/registry/react/eventRegistration-form";
import { FeedbackForm } from "@/registry/react/feedback-form";
import { InputForm } from "@/registry/react/input-field";
import { JobApplicationForm } from "@/registry/react/jobapplication-form";
import { MultiSelectForm } from "@/registry/react/multi-select-field";
import { OTPForm } from "@/registry/react/otp-field";
import { PasswordForm } from "@/registry/react/password-field";
import { PurchaseOrderForm } from "@/registry/react/purchase-order-form";
import { RadioGroupForm } from "@/registry/react/radio-group-field";
import { SelectForm } from "@/registry/react/select-field";
import { SignUp } from "@/registry/react/signup-form";
import { SliderForm } from "@/registry/react/slider-field";
import { SurveyForm } from "@/registry/react/surve-formy";
import { SwitchForm } from "@/registry/react/switch-field";
import { TextareaForm } from "@/registry/react/textarea-field";
import { ToggleGroupForm } from "@/registry/react/toggle-group-field";
import { WaitlistForm } from "@/registry/react/waitlist-form";
import { BookingForm as CustomerSupportForm } from "../../registry/react/customersupport-form";

const fieldItems = [
	{
		name: "checkbox-field",
		title: "Checkbox Field",
		description: "A checkbox field form.",
		component: CheckboxForm,
	},
	{
		name: "input-field",
		title: "Input Field",
		description: "An input field form.",
		component: InputForm,
	},
	{
		name: "password-field",
		title: "Password Field",
		description: "A password field form with visibility toggle.",
		component: PasswordForm,
	},
	{
		name: "otp-field",
		title: "OTP Field",
		description: "An OTP field form.",
		component: OTPForm,
	},
	{
		name: "textarea-field",
		title: "Textarea Field",
		description: "A textarea field form.",
		component: TextareaForm,
	},
	{
		name: "radio-group-field",
		title: "Radio Group Field",
		description: "A radio group field form.",
		component: RadioGroupForm,
	},
	{
		name: "toggle-group-field",
		title: "Toggle Group Field",
		description: "A toggle group field form.",
		component: ToggleGroupForm,
	},
	{
		name: "switch-field",
		title: "Switch Field",
		description: "A switch field form.",
		component: SwitchForm,
	},
	{
		name: "slider-field",
		title: "Slider Field",
		description: "A slider field form.",
		component: SliderForm,
	},
	{
		name: "select-field",
		title: "Select Field",
		description: "A select field form.",
		component: SelectForm,
	},
	{
		name: "multi-select-field",
		title: "Multi Select Field",
		description: "A multi-select field form.",
		component: MultiSelectForm,
	},
	{
		name: "date-picker-field",
		title: "Date Picker Field",
		description: "A date picker field form.",
		component: DatePickerForm,
	},
];

const items = [
	{
		name: "waitlist-form",
		title: "Waitlist Form",
		description: "A waitlist form for email signup.",
		component: WaitlistForm,
	},
	{
		name: "feedback-form",
		title: "Feedback Form",
		description: "A simple feedback form.",
		component: FeedbackForm,
	},
	{
		name: "contact-us-form",
		title: "Contact Us Form",
		description: "A contact form for users to send messages.",
		component: ContacUsForm,
	},
	{
		name: "signup-form",
		title: "Signup Form",
		description: "A signup form with name, email, password, and confirmation.",
		component: SignUp,
	},
	{
		name: "customer-support-form",
		title: "Customer Support Form",
		description: "A form for submitting customer support requests.",
		component: CustomerSupportForm,
	},
	{
		name: "booking-form",
		title: "Booking Form",
		description:
			"A booking form for placing orders with product selection, personal details, and payment.",
		component: BookingFormComp,
	},
	{
		name: "event-registration-form",
		title: "Event Registration Form",
		description: "A form for registering for events.",
		component: EventRegistrationForm,
	},
	{
		name: "job-application-form",
		title: "Job Application Form",
		description: "A form for job applications.",
		component: JobApplicationForm,
	},
	{
		name: "survey-form",
		title: "Survey Form",
		description: "A multi-step survey form.",
		component: SurveyForm,
	},
	{
		name: "purchase-order-form",
		title: "Purchase Order Form",
		description:
			"A purchase order form with multiple items using array fields.",
		component: PurchaseOrderForm,
	},
];

export { fieldItems, items };
