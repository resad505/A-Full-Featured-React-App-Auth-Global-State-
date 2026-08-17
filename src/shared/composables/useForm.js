import { reactive, computed } from 'vue';
import { runValidators } from '../utils/validators.js';

/**
 * useForm — Reusable Form State & Validation Composable (Checkpoint 4)
 * Implements manual validation pattern equivalent to React Hook Form.
 *
 * Usage:
 *   const { fields, errors, touched, isDirty, isValid, isSubmitting,
 *           setField, touchField, validateAll, resetForm, setSubmitting } = useForm(initialValues, rules);
 *
 * @param {Object} initialValues — { fieldName: defaultValue, ... }
 * @param {Object} rules — { fieldName: [(value) => { valid, error }, ...], ... }
 */
export function useForm(initialValues, rules = {}) {
  // Clone initial values for reset capability
  const _initial = JSON.parse(JSON.stringify(initialValues));

  // Reactive fields object — two-way bindable via v-model
  const fields = reactive({ ...initialValues });

  // Error messages per field — '' means no error
  const errors = reactive(
    Object.keys(initialValues).reduce((acc, k) => { acc[k] = ''; return acc; }, {})
  );

  // Touch state — true if user has interacted with the field
  const touched = reactive(
    Object.keys(initialValues).reduce((acc, k) => { acc[k] = false; return acc; }, {})
  );

  // Submitting loading flag
  const isSubmitting = reactive({ value: false });

  /**
   * Validates a single field and writes error to errors[fieldName].
   * @param {string} fieldName
   * @returns {boolean} — true if valid
   */
  function validateField(fieldName) {
    const fieldRules = rules[fieldName];
    if (!fieldRules || fieldRules.length === 0) {
      errors[fieldName] = '';
      return true;
    }
    const result = runValidators(fields[fieldName], fieldRules);
    errors[fieldName] = result.error;
    return result.valid;
  }

  /**
   * Set a field value and validate if already touched.
   * Use with @input or v-model.
   */
  function setField(fieldName, value) {
    fields[fieldName] = value;
    if (touched[fieldName]) {
      validateField(fieldName);
    }
  }

  /**
   * Mark field as touched and run validation.
   * Use with @blur on each input.
   */
  function touchField(fieldName) {
    touched[fieldName] = true;
    validateField(fieldName);
  }

  /**
   * Validates ALL fields regardless of touch state.
   * Marks every field as touched.
   * Returns true only if all fields pass.
   */
  function validateAll() {
    let allValid = true;
    for (const key of Object.keys(fields)) {
      touched[key] = true;
      const fieldValid = validateField(key);
      if (!fieldValid) allValid = false;
    }
    return allValid;
  }

  /**
   * Resets form to initial state — clears values, errors, and touch state.
   */
  function resetForm() {
    for (const key of Object.keys(_initial)) {
      fields[key] = _initial[key];
      errors[key] = '';
      touched[key] = false;
    }
    isSubmitting.value = false;
  }

  /**
   * Returns a plain copy of current field values (for dispatching to store).
   */
  function getValues() {
    return { ...fields };
  }

  function setSubmitting(val) {
    isSubmitting.value = val;
  }

  // Computed: true if any field differs from initial value
  const isDirty = computed(() => {
    return Object.keys(_initial).some(
      key => JSON.stringify(fields[key]) !== JSON.stringify(_initial[key])
    );
  });

  // Computed: true if no error messages exist (not a full validation run — only what has been touched)
  const isValid = computed(() => {
    return Object.values(errors).every(e => e === '');
  });

  return {
    fields,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    setField,
    touchField,
    validateAll,
    resetForm,
    getValues,
    setSubmitting
  };
}
