export const openWhatsApp = (message: string = "Hello Alerzen Health! I have a query.") => {
  const url = `https://api.whatsapp.com/send?phone=919986404073&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
