if(resp.ok) {
    alert(
      `✅ Purchase Successful!\n\n` +
      `Item purchased from retailer\n` +
      `New Balance: ₹${data.newBalance?.toLocaleString()}`
    );
      setModalOpen(false);
    }
