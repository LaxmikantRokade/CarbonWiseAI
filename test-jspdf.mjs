const test = async () => {
  const jspdf = await import('jspdf');
  console.log('jspdf:', Object.keys(jspdf));
  console.log('default:', jspdf.default);
  console.log('jsPDF:', jspdf.jsPDF);
}
test();
