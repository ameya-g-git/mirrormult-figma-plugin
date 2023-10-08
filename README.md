# **MirrorMult Figma**
After making an [addon](https://github.com/ameya-g-git/mirror-mult-obj-bpy#user-content-fn-2-f7cce865578bb4eaa8c8a47d8d0de273) for Blender that utlizes the Array and Mirror modifiers to make symmetrical designs, I thought to myself, wouldn't this be a great feature for Figma too? So, I got to work learning JS and TS to make **MirrorMult Figma**!

___

## **How to use**:
1. Before running the plugin, make sure to select all the objects you want symmetrized.

2. Stay on MirrorMult for axis symmetry (horizontal & vertical), or click on the RotSymm tab for rotational symmetry.

3. From there, it should be intuitive to do what you want to do. Select which axes to mirror across, or change how many copies you want for the rotational symmetry.

4. As for the origin of the symmetry, you have two options:
    
    a. Select another object, its center will act as the origin. The name of the object will appear near the bottom left.
    
    b. Check the "Use Empty Object" checkbox, which creates a cursor akin to Blender's 3D cursor that makes seeing center points and position much easier.

5. Once everything's done, just hit the button at the bottom and you've got your symmetrized graphic! 

## **Known Issues**
* Will not work on component objects, as the whole functionality of adaptive symmetry comes from using components
* If the objects being mirrored don't all have the same parent, issues are known to happen.