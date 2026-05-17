import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

// ====== BUTTON ======
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icone?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icone,
  fullWidth,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md disabled:bg-primary-300',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 disabled:bg-gray-50',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md disabled:bg-red-300',
    success:
      'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md disabled:bg-green-300',
    ghost: 'text-gray-700 hover:bg-gray-100',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {icone && <span className="flex-shrink-0">{icone}</span>}
      {children}
    </button>
  );
}

// ====== INPUT ======
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erro?: string;
  hint?: string;
}

export function Input({
  label,
  erro,
  hint,
  className = '',
  required,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 ${
          erro
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        } ${className}`}
        required={required}
        {...props}
      />
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      {hint && !erro && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ====== SELECT ======
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  erro?: string;
  opcoes: { valor: string; rotulo: string }[];
  placeholder?: string;
}

export function Select({
  label,
  erro,
  opcoes,
  placeholder,
  className = '',
  required,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          erro ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.rotulo}
          </option>
        ))}
      </select>
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

// ====== TEXTAREA ======
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  erro?: string;
  hint?: string;
}

export function Textarea({
  label,
  erro,
  hint,
  className = '',
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y ${
          erro ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        required={required}
        {...props}
      />
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      {hint && !erro && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ====== CARD ======
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        padding ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ====== BADGE ======
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ====== PAGE HEADER ======
interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  icone?: ReactNode;
}

export function PageHeader({
  titulo,
  descricao,
  acoes,
  icone,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        {icone && (
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
            {icone}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
          {descricao && (
            <p className="text-sm text-gray-600 mt-0.5">{descricao}</p>
          )}
        </div>
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

// ====== EMPTY STATE ======
interface EmptyStateProps {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

export function EmptyState({ icone, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icone && (
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
          {icone}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
      {descricao && (
        <p className="mt-1 text-sm text-gray-600 max-w-sm mx-auto">
          {descricao}
        </p>
      )}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
