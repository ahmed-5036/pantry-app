"use client";
import {firestore} from "@/firebase";
import {Box, Button, Fab, Modal, Stack, TextField, Typography} from "@mui/material";
import {collection, deleteDoc, doc, getDoc, getDocs, query, setDoc} from "firebase/firestore";
import {useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: 400,
    bgcolor: 'background.paper',
    color: 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
};

export default function Home() {
    const [pantry, setPantry] = useState([]);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [itemName, setItemName] = useState("");

    const updatePantry = async () => {
        const snapshot = query(collection(firestore, 'pantry'));
        const docs = await getDocs(snapshot);
        const pantryList = [];
        docs.forEach((doc) => {
            pantryList.push({name: doc.id, ...doc.data()});
        });
        setPantry(pantryList);
    };

    useEffect(() => {
        updatePantry();
    }, []);

    const addItem = async (item) => {
        const docRef = doc(collection(firestore, 'pantry'), item);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            const {count} = docSnapshot.data();
            await setDoc(docRef, {count: count + 1});
            await updatePantry();
        } else {
            await setDoc(docRef, {count: 1});
            updatePantry();
        }
    };

    const removeItem = async (item) => {
        const docRef = doc(collection(firestore, 'pantry'), item);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            const {count} = docSnapshot.data();
            if (count === 1) {
                await deleteDoc(docRef);
            } else {
                await setDoc(docRef, {count: count - 1});
            }
            await updatePantry();
        }
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            backgroundColor="white"
            gap={2}
        >
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add Item
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            id="outlined-basic"
                            label="Item"
                            variant="outlined"
                            fullWidth
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                        <Button variant="outlined" onClick={() => {
                            addItem(itemName)
                            setItemName('')
                            handleClose()
                        }}>Add</Button>
                    </Stack>
                </Box>
            </Modal>

            <Box
                border="1px solid black"
                width="90%"
                maxWidth="800px"
                margin="auto"
                position="relative" // Set relative positioning for the container
            >
                <Box
                    width="100%"
                    height="100px"
                    bgcolor="#ADD8E6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative" // Ensure absolute positioning of children
                >
                    <Typography
                        variant="h3"
                        color="#333"
                        textAlign="center"
                        fontWeight="300"
                    >
                        Pantry Items
                    </Typography>
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={handleOpen}
                        sx={{
                            position: 'absolute',
                            right: 16, // Adjust spacing from the right edge
                            bottom: 16, // Adjust spacing from the bottom edge
                        }}
                    >
                        <AddIcon/>
                    </Fab>
                </Box>
                <Stack
                    width="100%"
                    maxHeight="300px"
                    spacing={2}
                    overflow="auto"
                    alignItems="center"
                >
                    {pantry.map(({name, count}) => (
                        <Box
                            key={name}
                            width="100%"
                            minHeight="150px"
                            display="flex"
                            justifyContent="space-between"
                            paddingX={2}
                            alignItems="center"
                            bgcolor="#f0f0f0"
                            sx={{
                                '@media (min-width:600px)': {paddingX: 5},
                                '@media (max-width:600px)': {paddingX: 1}
                            }}
                        >
                            <Typography
                                variant="h3"
                                color="#333"
                                textAlign="center"
                                fontWeight="bold"
                            >
                                {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
                            </Typography>
                            <Typography variant="h3" color="#333" textAlign="center">
                                Quantity: {count}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    removeItem(name);
                                    setItemName('');
                                    handleClose();
                                }}
                            >
                                Remove
                            </Button>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}
