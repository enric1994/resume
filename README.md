
# How to Create Your Own 3D Resume

Hello, and welcome to this quick guide! I've spent a [considerable amount of time](https://discourse.threejs.org/t/my-3d-resume-feedback-please/31327) figuring out how to craft a 3D resume that stands out. Now, I'd love to share that knowledge with you. Here's the [link to my 3D resume for reference](https://resume.enricmor.eu).

<img src="preview.png" alt="3D resume" width="250"/>

## Prerequisites

- Basic understanding of HTML, JavaScript, and CSS.
- A computer with Blender installed.
- A GitHub account (for hosting your resume).

## Step 1: Setting Up Your Environment

Download this repository, navigate to the `example/` folder, and open a terminal in this directory.

Run the following command to start a simple HTTP server:

```bash
python3 -m http.server
```

Open your web browser and go to `localhost:8000` to see the minimal demo.

## Step 2: Learn Some Blender Basics

Your initial focus should be on learning some Blender. It will likely consume the bulk of your time but it's totally worth it. Here are some recommended [video tutorials](https://www.youtube.com/watch?v=1jHUY3qoBu8).

### Tips:
- Spend some time watching Blender videos and practicing before trying to build your resume. Make sure you learn all the useful shortcuts and Blender operations.
- Sketch your design on paper, this will help you visualise the multiple scenes.
- Stick to a low-poly design where possible, as it's easier to manage and loads faster.
- Use a standard colour palette, like [this one](https://coolors.co/2176ae-57b8ff-b66d0d-fbb13c-fe6847).
- Use a rigged model like [this one](https://www.youtube.com/watch?v=mnP54h3x6_Y) to display your persona.
- Optionally, you can add simple animations to the 3D scene to make it more dynamic.

You can download Blender [here](https://www.blender.org/download/). I suggest you to build your resume on top of the existing `examples/blender.blend` project.

## Step 3: Export Your 3D Model

Once you're satisfied with your 3D model, you can proceed to export it. Use the following settings:
- **Format**: GLTF
- **File Path**: `examples/model.gltf`

After exporting, refresh `localhost:8000` to see your model. Before going to the next step, make sure that the website looks good in different viewports (smartphone, tablet, desktop)

## Step 4: Adjust JavaScript for Lighting

Navigate to `example/js/lights.js`. Here you'll find different types of lights used in the scene. 

### Tips:
- Move the lights around to ensure the shadows are visible. Directional lights are poinint to the centre.
- Adjust the intensity and colour of the lights.
- Add more lights if you need more complexity, but keep in mind that it will make the webpage slower.

You can also change the background gradients by editing the `example/js/control.js` file.

## Step 5: Update Metadata

Navigate to `example/index.html` and change the `<head>` section with your personal information.
Additionally, you can set a link that appears in the middle of the screen. The link is helpful to connect to you Linkedin. The text and URL is set in `example/index.html`. The height when the link appears is defined in `example/control.js` (currently `model.position.y >= 50`).

## Step 6 (optional): Compress the 3D model to reduce loading time

In order to make the GLTF model lighter [install the Draco encoder](https://github.com/CesiumGS/gltf-pipeline) and run `gltf-pipeline -i model.gltf -o model.gltf -d`.

## Step 7: Publish Using GitHub Pages

Publish your resume online using GitHub Pages. It will be hosted for free and accessible via `https://your_username.github.io/resume`. Follow [these instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) to get it set up.

And that's it! You've successfully created your very own 3D resume. It might seem like a lot at first, but trust me, the effort is well worth it. Good luck!
