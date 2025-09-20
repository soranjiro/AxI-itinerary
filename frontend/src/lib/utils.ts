import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const formatDateTime = (dateTime: string | Date): string => {
	const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
	return date.toLocaleString('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
};

export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat('ja-JP', {
		style: 'currency',
		currency: 'JPY'
	}).format(amount);
};

export const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

export const validateRequired = (value: string | undefined | null): boolean => {
	return value !== undefined && value !== null && value.trim() !== '';
};

export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
	if (password.length < 4) {
		return { valid: false, message: 'パスワードは4文字以上である必要があります' };
	}
	if (password.length > 20) {
		return { valid: false, message: 'パスワードは20文字以下である必要があります' };
	}
	return { valid: true, message: '' };
};

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
};
