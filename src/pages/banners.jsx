import { useState } from "react";
import "../css/banner.css"
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";

function Banners() {
  const [topBanner, setTopBanner] = useState(["https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png", "https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png", "https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png"]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  function handleSave() {
    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setTopBanner((prevBanners) => [...prevBanners, reader.result]);
      setDialogOpen(false);
      setSelectedFile(null);
    };

    // Read the file as a data URL (base64 encoded string)
    reader.readAsDataURL(selectedFile);
  }
  return (
    <>
      <div className="banners-page-container">
        <h1 className="banners-page-header">BANNERS</h1>
        <div className="banners-page-subheader">
          <h2>TOP BANNER</h2>
          <button className="banners-page-add-banner-button" onClick={() => setDialogOpen(true)}><Plus />ADD</button>
        </div>
        <div className="banners-page-top-banners-container">
          {
            topBanner.map((banner, index) => {
              return (
                <div className="banners-page-banner-container">
                  <img src={banner} alt="" />
                  <button onClick={() => setTopBanner(topBanner.filter((_, i) => i !== index))}>DELETE</button>
                </div>
              )
            })
          }
        </div>
      </div>


      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>ADD TOP BANNER</DialogTitle>
        <DialogContent dividers>
          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>

  );
}

export default Banners;