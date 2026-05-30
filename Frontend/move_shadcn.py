import os
import shutil

base_dir = "/home/niranjanghising/Documents/ai_agends/Fullstack/Frontend"
components_src = os.path.join(base_dir, "components")
components_dest = os.path.join(base_dir, "src", "components")

lib_src = os.path.join(base_dir, "lib")
lib_dest = os.path.join(base_dir, "src", "lib")

hooks_src = os.path.join(base_dir, "hooks")
hooks_dest = os.path.join(base_dir, "src", "hooks")

for src, dest in [(components_src, components_dest), (lib_src, lib_dest), (hooks_src, hooks_dest)]:
    if os.path.exists(src):
        for item in os.listdir(src):
            s = os.path.join(src, item)
            d = os.path.join(dest, item)
            if not os.path.exists(dest):
                os.makedirs(dest)
            if os.path.isdir(s):
                if not os.path.exists(d):
                    shutil.move(s, d)
            else:
                shutil.move(s, d)
        shutil.rmtree(src)
